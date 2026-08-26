/**
 * minify.ts — Đồng bộ phiên bản đã minify của toàn bộ asset vào một thư mục riêng.
 *
 *   js/app.js            ->  encode/js/app.js
 *   common/style/x.css   ->  encode/common/style/x.css
 *   cate/desktop/i.html  ->  encode/cate/desktop/i.html
 *
 * - Giữ NGUYÊN file gốc (chỉ ghi ra thư mục đích, mặc định `encode/`).
 * - Giữ NGUYÊN đường dẫn tương đối (mirror cây thư mục).
 * - LOẠI TRỪ mọi file nằm trong .gitignore (dùng `git ls-files` làm nguồn chân lý).
 * - Minify: .js/.mjs/.cjs (esbuild) · .css (lightningcss) · .html/.htm (html-minifier-terser).
 * - File khác (ảnh, font, json, ...) được copy nguyên trạng -> encode/ là bản sao chạy được độc lập.
 * - An toàn cho production: mỗi output JS/CSS được PARSE LẠI; nếu minify ra code hỏng
 *   thì tự động copy file gốc thay thế. encode/ không bao giờ chứa file lỗi.
 *
 * Cách dùng:
 *   bun a_script/minify.ts                # đồng bộ toàn bộ repo -> encode/
 *   bun a_script/minify.ts common detail  # chỉ đồng bộ các thư mục/file chỉ định
 *   bun a_script/minify.ts --dry-run      # xem trước, không ghi gì
 *   bun a_script/minify.ts --force        # bỏ qua mtime, build lại tất cả
 *   bun a_script/minify.ts --watch        # đồng bộ liên tục khi có thay đổi
 *   bun a_script/minify.ts --out dist-min # đổi thư mục đích
 *   bun a_script/minify.ts --no-prune     # giữ lại file thừa trong encode/
 *   bun a_script/minify.ts --help
 */

import { mkdir, stat, readdir, rm, rmdir } from "node:fs/promises";
import { watch } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import * as esbuild from "esbuild";
import { transform as lightningTransform, Features } from "lightningcss";
import { minify as htmlMinify } from "html-minifier-terser";

// ---------------------------------------------------------------------------
// Cấu hình
// ---------------------------------------------------------------------------

const DEFAULT_OUT = "encode";
const DEFAULT_CONCURRENCY = 24;

/** Phần mở rộng -> loại xử lý. Mọi thứ khác sẽ được copy nguyên trạng. */
const KIND_BY_EXT: Record<string, "js" | "css" | "html"> = {
  js: "js",
  mjs: "js",
  cjs: "js",
  css: "css",
  html: "html",
  htm: "html",
};

const HTML_MINIFY_OPTS = {
  collapseWhitespace: true,
  conservativeCollapse: true, // gộp về 1 khoảng trắng, không bao giờ dính chữ (an toàn layout inline)
  removeComments: true,
  ignoreCustomComments: [/^\s*(?:#|\[if|<!\[endif|ssi:|esi:|noindex)/i],
  minifyCSS: true,
  minifyJS: true,
  removeScriptTypeAttributes: true, // bỏ type="text/javascript" nhưng GIỮ type="module"
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
  caseSensitive: true, // an toàn cho SVG/foreignObject
  html5: true,
  continueOnParseError: true,
} as const;

// Các lý do "fallback" được coi là CỐ Ý (không phải lỗi): file vốn không nên minify.
const EXPECTED_FALLBACK = new Set(["tailwind-source", "server-template"]);

// Tailwind input (source.css) không phải CSS chuẩn -> copy nguyên trạng, không minify.
const TAILWIND_SOURCE_RE =
  /@tailwind\b|@import\s+["']tailwindcss|@apply\b|@theme\b|@variant\b|@custom-variant\b|@utility\b|@plugin\b/;
// HTML chứa tag server-template (EJS/ASP/JSP `<%…%>`, PHP `<?php`/`<?=`, hoặc cặp
// `{{…}}` của Handlebars/Vue/Mustache) -> copy nguyên trạng để khỏi hỏng cú pháp template.
// Lưu ý: KHÔNG bắt `}}` đơn lẻ (rất hay gặp trong JS inline lồng object).
const SERVER_TAG_RE = /<%|<\?(?:php|=)|\{\{[^}]*?\}\}/;

// ---------------------------------------------------------------------------
// Sàn trình duyệt cho asset phát hành
// ---------------------------------------------------------------------------

/**
 * Chrome 109 là bản Chrome CUỐI CÙNG cho Windows 7/8.1 (01/2023) — máy đó không
 * nâng cấp được nữa. Tailwind v4 lại nhắm Chrome 111+, nên output của nó dùng
 * CSS nesting (Chrome 112), oklch()/oklab() (111) và color-mix() (111).
 *
 * Không truyền `targets` thì lightningcss CHỈ nén khoảng trắng và GIỮ NGUYÊN cú
 * pháp mới -> trang vỡ style trên Chrome 109. Đây là điểm chặn duy nhất cho toàn
 * bộ CSS phát hành: mọi URL công khai của site đều trỏ vào encode/.
 *
 * Số version là 24-bit, mỗi byte một thành phần semver: major<<16 | minor<<8 | patch.
 *
 * KHÔNG hạ cấp được (nằm ngoài tầm với của mọi công cụ, xem docs/legacy-browser-support.md):
 *   @layer -> Chrome 99 · :has() -> 105 · translate:/rotate:/scale: -> 104
 */
export const CSS_TARGETS = {
  chrome: 90 << 16,
  edge: 90 << 16,
  firefox: 91 << 16,
  safari: (15 << 16) | (6 << 8),
  ios_saf: (15 << 16) | (6 << 8),
  samsung: 15 << 16,
};

/**
 * Sàn cú pháp cho JS. esbuild chỉ kiểm CÚ PHÁP, không kiểm API — các API hậu-109
 * (.toSorted, Object.groupBy, ...) do a_script/check-legacy.ts chặn.
 */
export const JS_TARGET = ["chrome109"];

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------

const toPosix = (p: string) => p.split(sep).join("/");

function extOf(path: string): string {
  const base = path.slice(path.lastIndexOf("/") + 1);
  const dot = base.lastIndexOf(".");
  return dot <= 0 ? "" : base.slice(dot + 1).toLowerCase();
}

function classify(relPath: string): "js" | "css" | "html" | "copy" {
  return KIND_BY_EXT[extOf(relPath)] ?? "copy";
}

/** Pool async giới hạn số tác vụ chạy đồng thời. */
async function pMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) || 1 },
    async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i] as T, i);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

const ensuredDirs = new Set<string>();
async function ensureDir(dir: string) {
  if (ensuredDirs.has(dir)) return;
  await mkdir(dir, { recursive: true });
  ensuredDirs.add(dir);
}

// ---------------------------------------------------------------------------
// Minifiers (export để test). Mỗi hàm trả về chuỗi đã minify, throw nếu lỗi.
// ---------------------------------------------------------------------------

export async function minifyJs(code: string, relPath: string): Promise<string> {
  const res = await esbuild.transform(code, {
    loader: "js",
    minify: true,
    legalComments: "none",
    sourcefile: relPath,
    target: JS_TARGET,
  });
  // Kiểm tra lại: output phải parse được ở ĐÚNG sàn đã hạ cấp (trước đây chạy
  // mặc định "esnext" nên không bắt được cú pháp vượt mức hỗ trợ).
  await esbuild.transform(res.code, { loader: "js", sourcefile: relPath, target: JS_TARGET });
  return res.code;
}

/**
 * Sửa giá trị fallback của modifier độ mờ.
 *
 * Tailwind v4 biên dịch `t:bg-black/5` thành hai lớp: một khai báo thường dùng
 * MÀU ĐẶC, rồi một khai báo `color-mix()` bọc trong `@supports`. Trình duyệt
 * không có `color-mix()` (Chrome < 111) dừng ở lớp đầu và nhận màu đặc 100%,
 * nên lớp phủ che kín nội dung bên dưới.
 *
 * Hàm này thay màu đặc đó bằng `rgba()` tương đương — `color-mix(in oklab, C p%,
 * transparent)` cho ra đúng C với alpha nhân p%, nên đây là giá trị chính xác
 * chứ không phải xấp xỉ. Trình duyệt hiện đại vẫn đọc nhánh `@supports` như cũ,
 * không đổi gì; sửa TẠI CHỖ nên cũng không đụng tới thứ tự cascade.
 *
 * Chỉ xử lý được khi màu gốc quy về hex trong `@theme`/`:root` của chính file đó.
 * Trường hợp không quy được (`currentcolor`, màu oklch) thì để nguyên.
 */
export function fixOpacityFallback(css: string): string {
  const vars = new Map<string, string>();
  for (const m of css.matchAll(/(--[\w-]*color[\w-]*)\s*:\s*(#[0-9a-fA-F]{3,8})\s*[;}]/g)) {
    if (!vars.has(m[1]!)) vars.set(m[1]!, m[2]!);
  }

  const toRgba = (hex: string, pct: number): string | null => {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6) return null; // bỏ qua hex đã có alpha
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = String(Math.round(pct) / 100).replace(/^0\./, ".");
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // `prop: var(--x);` … `@supports (color: color-mix(in lab, red, red)) { prop: color-mix(in oklab, var(--x) N%, transparent) }`
  const RE =
    /([-\w]+)\s*:\s*var\((--[\w-]+)\)\s*;(\s*@supports\s*\(color:\s*color-mix\(in lab,\s*red,\s*red\)\)\s*\{\s*)\1\s*:\s*color-mix\(in oklab,\s*var\(\2\)\s+([\d.]+)%,\s*transparent\)/g;

  return css.replace(RE, (whole, prop, name, mid, pct) => {
    const hex = vars.get(name);
    const rgba = hex && toRgba(hex, parseFloat(pct));
    if (!rgba) return whole;
    return `${prop}: ${rgba};${mid}${prop}: color-mix(in oklab, var(${name}) ${pct}%, transparent)`;
  });
}

export function minifyCss(code: string, relPath: string): string {
  if (TAILWIND_SOURCE_RE.test(code)) {
    throw new Error("tailwind-source"); // -> caller copy nguyên trạng
  }
  const res = lightningTransform({
    filename: relPath,
    code: Buffer.from(fixOpacityFallback(code)),
    minify: true,
    targets: CSS_TARGETS,
    // Ép làm phẳng nesting kể cả khi ai đó nới CSS_TARGETS về sau.
    include: Features.Nesting,
  });
  const out = new TextDecoder().decode(res.code);
  // Kiểm tra lại: output phải parse được như CSS hợp lệ.
  lightningTransform({ filename: relPath, code: Buffer.from(out), minify: false });
  return out;
}

export async function minifyHtml(code: string, _relPath: string): Promise<string> {
  if (SERVER_TAG_RE.test(code)) {
    throw new Error("server-template"); // -> caller copy nguyên trạng
  }
  return await htmlMinify(code, HTML_MINIFY_OPTS);
}

// ---------------------------------------------------------------------------
// Liệt kê nguồn (loại trừ .gitignore qua git)
// ---------------------------------------------------------------------------

async function gitRoot(): Promise<string> {
  try {
    return (await Bun.$`git rev-parse --show-toplevel`.quiet().text()).trim();
  } catch {
    throw new Error(
      "Không phải git repo. Script dựa vào git để loại trừ file trong .gitignore.",
    );
  }
}

/** Tất cả file KHÔNG bị .gitignore (đã theo dõi + chưa theo dõi nhưng không ignore). */
async function listSources(root: string): Promise<string[]> {
  const raw = await Bun.$`git -C ${root} ls-files -z --cached --others --exclude-standard`
    .quiet()
    .text();
  return raw.split("\0").filter(Boolean).map(toPosix);
}

function inScope(relPath: string, filters: string[]): boolean {
  if (filters.length === 0) return true;
  return filters.some((f) => relPath === f || relPath.startsWith(f + "/"));
}

// ---------------------------------------------------------------------------
// Xử lý 1 file
// ---------------------------------------------------------------------------

type Action = "minified" | "copied" | "fallback" | "skipped" | "would";
type Kind = "js" | "css" | "html" | "copy";

interface Ctx {
  root: string;
  outRel: string; // đường dẫn OUT tương đối với root (posix)
  outAbs: string;
  force: boolean;
  dryRun: boolean;
  prune: boolean;
  quiet: boolean;
}

interface FileResult {
  action: Action;
  kind: Kind;
  bytesIn: number;
  bytesOut: number;
  reason?: string; // lý do fallback (nếu có)
}

async function syncFile(relPath: string, ctx: Ctx): Promise<FileResult> {
  const srcAbs = join(ctx.root, relPath);
  const destAbs = join(ctx.outAbs, relPath);

  const kind = classify(relPath);

  // An toàn: dest phải nằm trong OUT.
  if (!destAbs.startsWith(ctx.outAbs + sep)) {
    return { action: "skipped", kind, bytesIn: 0, bytesOut: 0, reason: "ngoài-OUT" };
  }

  const sSt = await stat(srcAbs);

  // Bỏ qua nếu output đã mới hơn nguồn (trừ khi --force).
  if (!ctx.force) {
    try {
      const dSt = await stat(destAbs);
      if (dSt.mtimeMs >= sSt.mtimeMs) {
        return { action: "skipped", kind, bytesIn: sSt.size, bytesOut: dSt.size };
      }
    } catch {
      /* dest chưa có -> xử lý tiếp */
    }
  }

  // File nhị phân / không minify được -> copy.
  if (kind === "copy") {
    if (ctx.dryRun) return { action: "would", kind, bytesIn: sSt.size, bytesOut: sSt.size };
    await ensureDir(dirname(destAbs));
    await Bun.write(destAbs, Bun.file(srcAbs));
    return { action: "copied", kind, bytesIn: sSt.size, bytesOut: sSt.size };
  }

  const srcText = await Bun.file(srcAbs).text();

  let minified: string | null = null;
  let reason: string | undefined;
  try {
    if (kind === "js") minified = await minifyJs(srcText, relPath);
    else if (kind === "css") minified = minifyCss(srcText, relPath);
    else minified = await minifyHtml(srcText, relPath);
  } catch (err: any) {
    // Minify thất bại (cú pháp lạ, tailwind-source, server-template, output hỏng...)
    // -> copy nguyên trạng, không bao giờ ghi code hỏng.
    reason = err?.message ? String(err.message).slice(0, 60) : "lỗi-minify";
    minified = null;
  }

  if (ctx.dryRun) {
    if (minified === null)
      return { action: "would", kind, bytesIn: sSt.size, bytesOut: sSt.size, reason };
    return { action: "would", kind, bytesIn: sSt.size, bytesOut: Buffer.byteLength(minified) };
  }

  await ensureDir(dirname(destAbs));
  if (minified === null) {
    await Bun.write(destAbs, srcText);
    return { action: "fallback", kind, bytesIn: sSt.size, bytesOut: sSt.size, reason };
  }
  const bytesOut = await Bun.write(destAbs, minified);
  return { action: "minified", kind, bytesIn: sSt.size, bytesOut };
}

// ---------------------------------------------------------------------------
// Dọn file thừa (prune)
// ---------------------------------------------------------------------------

async function* walk(dir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function pruneStale(
  ctx: Ctx,
  expectedAbs: Set<string>,
  filters: string[],
): Promise<string[]> {
  const removed: string[] = [];
  for await (const fileAbs of walk(ctx.outAbs)) {
    const relFromOut = toPosix(relative(ctx.outAbs, fileAbs));
    if (!inScope(relFromOut, filters)) continue; // có filter -> chỉ prune trong phạm vi
    if (!expectedAbs.has(fileAbs)) removed.push(fileAbs);
  }
  if (!ctx.dryRun) {
    for (const f of removed) await rm(f, { force: true });
    await removeEmptyDirs(ctx.outAbs, ctx.outAbs);
  }
  return removed;
}

/** Xoá thư mục rỗng bên trong `stopAt` (không xoá chính `stopAt`). */
async function removeEmptyDirs(dir: string, stopAt: string): Promise<boolean> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  let empty = true;
  for (const e of entries) {
    if (e.isDirectory()) {
      const childEmpty = await removeEmptyDirs(join(dir, e.name), stopAt);
      if (!childEmpty) empty = false;
    } else {
      empty = false;
    }
  }
  if (empty && dir !== stopAt) {
    try {
      await rmdir(dir);
    } catch {
      /* ignore */
    }
  }
  return empty;
}

// ---------------------------------------------------------------------------
// Báo cáo
// ---------------------------------------------------------------------------

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// Chạy 1 lần
// ---------------------------------------------------------------------------

async function runOnce(ctx: Ctx, filters: string[]): Promise<void> {
  const all = await listSources(ctx.root);
  const sources = all.filter(
    (p) => p !== ctx.outRel && !p.startsWith(ctx.outRel + "/") && inScope(p, filters),
  );

  if (sources.length === 0) {
    console.warn("⚠️  Không có file nguồn nào khớp.");
    return;
  }

  const results = await pMap(sources, (rel) => syncFile(rel, ctx), DEFAULT_CONCURRENCY);

  const counts = { minified: 0, copied: 0, fallback: 0, skipped: 0, would: 0, wouldMinify: 0 };
  let bytesIn = 0;
  let bytesOut = 0;
  const expectedSkips: string[] = []; // tailwind-source / server-template (cố ý)
  const errors: string[] = []; // lỗi minify thật sự
  results.forEach((r, i) => {
    counts[r.action]++;
    // Chỉ tính tỉ lệ nén trên file THỰC SỰ được minify (kind js/css/html, không fallback).
    const isMinifyCandidate = r.kind !== "copy" && !r.reason;
    if ((r.action === "minified" || (r.action === "would" && isMinifyCandidate))) {
      bytesIn += r.bytesIn;
      bytesOut += r.bytesOut;
      if (r.action === "would") counts.wouldMinify++;
    }
    if (r.action === "fallback") {
      const line = `${sources[i]} (${r.reason})`;
      (EXPECTED_FALLBACK.has(r.reason ?? "") ? expectedSkips : errors).push(line);
    }
    if (r.action === "would" && !isMinifyCandidate && !r.reason && !ctx.quiet)
      void 0; // copy thuần, không cần log từng file
  });

  // Prune file thừa
  let removed: string[] = [];
  if (ctx.prune) {
    const expected = new Set(sources.map((rel) => join(ctx.outAbs, rel)));
    removed = await pruneStale(ctx, expected, filters);
  }

  // Tổng kết
  const saved = bytesIn - bytesOut;
  const pct = bytesIn > 0 ? ((saved / bytesIn) * 100).toFixed(1) : "0";
  const tag = ctx.dryRun ? "DRY-RUN " : "";
  console.log(`\n${tag}→ ${ctx.outRel}/`);
  if (ctx.dryRun) {
    const wouldCopy = counts.would - counts.wouldMinify;
    console.log(
      `  sẽ minify: ${counts.wouldMinify}   sẽ copy: ${wouldCopy}   đã mới (bỏ qua): ${counts.skipped}`,
    );
  } else {
    console.log(
      `  minify: ${counts.minified}   copy: ${counts.copied}   skip: ${counts.skipped}` +
        (counts.fallback ? `   copy-gốc: ${counts.fallback}` : ""),
    );
  }
  if (bytesIn > 0)
    console.log(`  dung lượng code minify: ${fmtBytes(bytesIn)} → ${fmtBytes(bytesOut)} (giảm ${pct}%)`);
  if (!ctx.prune) console.log("  (prune tắt — giữ lại file thừa)");
  if (removed.length > 0) {
    console.log(`  ${ctx.dryRun ? "sẽ xoá" : "đã xoá"} file thừa: ${removed.length}`);
    if (!ctx.quiet)
      removed.slice(0, 20).forEach((f) => console.log(`    - ${toPosix(relative(ctx.outAbs, f))}`));
    if (removed.length > 20) console.log(`    … và ${removed.length - 20} file nữa`);
  }
  if (expectedSkips.length > 0)
    console.log(`  ℹ️  ${expectedSkips.length} file copy nguyên trạng (tailwind-source/server-template)`);
  if (errors.length > 0) {
    console.log(`  ⚠️  ${errors.length} file LỖI minify (đã copy gốc — nên kiểm tra):`);
    errors.slice(0, 30).forEach((f) => console.log(`    - ${f}`));
  }
}

// ---------------------------------------------------------------------------
// Watch (đồng bộ liên tục)
// ---------------------------------------------------------------------------

async function isIgnored(root: string, relPath: string): Promise<boolean> {
  const res = await Bun.$`git -C ${root} check-ignore -q ${relPath}`.quiet().nothrow();
  return res.exitCode === 0;
}

async function runWatch(ctx: Ctx, filters: string[]): Promise<void> {
  await runOnce(ctx, filters);
  console.log("\n👀 Đang theo dõi thay đổi… (Ctrl+C để dừng)");

  const pending = new Map<string, ReturnType<typeof setTimeout>>();
  const handle = async (relPath: string) => {
    const srcAbs = join(ctx.root, relPath);
    const destAbs = join(ctx.outAbs, relPath);
    let exists = true;
    try {
      await stat(srcAbs);
    } catch {
      exists = false;
    }
    if (!exists) {
      await rm(destAbs, { force: true });
      console.log(`  ✕ xoá  ${relPath}`);
      return;
    }
    if (await isIgnored(ctx.root, relPath)) return;
    const r = await syncFile(relPath, { ...ctx, force: true });
    if (r.action !== "skipped") {
      const label = r.action === "minified" ? "minify" : r.action === "fallback" ? "copy*" : "copy";
      console.log(`  ✓ ${label}  ${relPath}`);
    }
  };

  watch(ctx.root, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    const relPath = toPosix(filename.toString());
    if (relPath.startsWith(".git/")) return;
    if (relPath === ctx.outRel || relPath.startsWith(ctx.outRel + "/")) return;
    if (!inScope(relPath, filters)) return;
    clearTimeout(pending.get(relPath)); // debounce 200ms / file
    pending.set(
      relPath,
      setTimeout(() => {
        pending.delete(relPath);
        handle(relPath).catch((e) => console.error(`  ! ${relPath}: ${e?.message ?? e}`));
      }, 200),
    );
  });

  await new Promise(() => {}); // giữ tiến trình sống
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`minify.ts — đồng bộ bản minify vào thư mục riêng (mặc định: ${DEFAULT_OUT}/)

Cách dùng:
  bun a_script/minify.ts [đường-dẫn...] [tuỳ-chọn]

Đối số:
  đường-dẫn       Chỉ đồng bộ các thư mục/file này (vd: common detail). Bỏ trống = toàn repo.

Tuỳ chọn:
  --out <dir>     Thư mục đích (mặc định: ${DEFAULT_OUT})
  -n, --dry-run   Xem trước, không ghi/không xoá gì
  -f, --force     Bỏ qua mtime, build lại tất cả
  --no-prune      Không xoá file thừa trong thư mục đích
  --watch         Đồng bộ liên tục khi file thay đổi
  -q, --quiet     Bớt log
  -h, --help      Hiển thị trợ giúp

Quy tắc:
  • Loại trừ mọi file trong .gitignore (qua git).
  • Minify .js/.mjs/.cjs · .css · .html/.htm; file khác copy nguyên trạng.
  • Output JS/CSS được parse lại; nếu hỏng sẽ copy file gốc thay thế.`);
}

async function main() {
  const argv = process.argv.slice(2);
  const filters: string[] = [];
  let out = DEFAULT_OUT;
  let dryRun = false;
  let force = false;
  let prune = true;
  let watchMode = false;
  let quiet = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        printHelp();
        return;
      case "-n":
      case "--dry-run":
        dryRun = true;
        break;
      case "-f":
      case "--force":
        force = true;
        break;
      case "--no-prune":
        prune = false;
        break;
      case "--watch":
        watchMode = true;
        break;
      case "-q":
      case "--quiet":
        quiet = true;
        break;
      case "--out":
        out = argv[++i] ?? DEFAULT_OUT;
        break;
      default:
        if (a?.startsWith("-")) {
          console.error(`Tuỳ chọn không hợp lệ: ${a}`);
          process.exit(1);
        }
        filters.push(toPosix(a!).replace(/^\.\//, "").replace(/\/+$/, ""));
    }
  }

  const root = await gitRoot();
  const outAbs = resolve(root, out);
  const outRel = toPosix(relative(root, outAbs));

  // An toàn: OUT phải là thư mục con trong repo.
  if (outRel === "" || outRel.startsWith("..")) {
    console.error(`❌ --out phải là thư mục con của repo. Nhận: "${out}"`);
    process.exit(1);
  }

  const ctx: Ctx = { root, outRel, outAbs, force, dryRun, prune, quiet };

  const t0 = Bun.nanoseconds();
  try {
    if (watchMode) {
      await runWatch(ctx, filters);
    } else {
      await runOnce(ctx, filters);
      const ms = (Bun.nanoseconds() - t0) / 1e6;
      console.log(`  ⏱  ${ms.toFixed(0)} ms`);
    }
  } finally {
    await esbuild.stop();
  }
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(`Lỗi: ${e?.message ?? e}`);
    process.exit(1);
  });
}
