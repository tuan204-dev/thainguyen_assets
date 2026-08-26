/**
 * check-legacy.ts — Cổng kiểm tra tương thích trình duyệt cũ cho asset đã build.
 *
 * Chặn không cho phát hành CSS/JS dùng cú pháp vượt quá sàn khai báo trong
 * a_script/minify.ts (CSS_TARGETS / JS_TARGET). Sinh ra vì Tailwind v4 nhắm
 * Chrome 111+ trong khi Chrome 109 là bản cuối cùng cho Windows 7/8.1: mỗi lần
 * nâng version Tailwind là một lần cú pháp mới có thể lọt ra CDN.
 *
 * Cách dùng:
 *   bun a_script/check-legacy.ts              # kiểm tra encode/
 *   bun a_script/check-legacy.ts dist-min     # kiểm tra thư mục khác
 *   bun a_script/check-legacy.ts --warn-only  # báo cáo nhưng luôn exit 0
 *
 * Exit 1 nếu có lỗi CHẶN. Cảnh báo (WARN) không làm fail.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import * as esbuild from "esbuild";
import { JS_TARGET } from "./minify.ts";

// ---------------------------------------------------------------------------
// Luật
// ---------------------------------------------------------------------------

/** Hàm màu cần fallback. Hợp lệ nếu được @supports bọc HOẶC có khai báo cùng
 *  property đứng trước trong cùng rule (kiểu duplicate-declaration). */
const COLOR_FN_RE = /(?<![\w-])(oklch|oklab|lch|lab|color-mix|light-dark)\(/g;

/** Hàm màu lightningcss LUÔN hạ cấp được -> còn sót nghĩa là chưa qua transform. */
const MUST_BE_GONE = new Set(["oklch", "oklab", "lch"]);

/** Cú pháp lightningcss cho đi im lặng vì không hạ cấp được. CHẶN. */
const CSS_BLOCK: [string, RegExp][] = [
  ["nesting &", /[{};]\s*&/],
  ["@container", /@container[\s(]/],
  ["@scope", /@scope[\s{(]/],
  ["@starting-style", /@starting-style/],
  ["subgrid", /(?<![\w-])subgrid(?![\w-])/],
  ["text-wrap", /(?<![\w-])text-wrap\s*:/],
  ["field-sizing", /(?<![\w-])field-sizing\s*:/],
  ["anchor positioning", /(?<![\w-])(anchor-name|position-anchor)\s*:/],
  ["calc-size()", /(?<![\w-])calc-size\(/],
  ["contrast-color()", /(?<![\w-])contrast-color\(/],
  ["interpolate-size", /(?<![\w-])interpolate-size\s*:/],
  ["corner-shape", /(?<![\w-])corner-shape\s*:/],
  ["text-box", /(?<![\w-])text-box(-trim|-edge)?\s*:/],
  ["::details-content", /::details-content/],
  [":user-valid/:user-invalid", /:user-(in)?valid/],
];

/** Đã biết là vượt sàn Chrome 90 nhưng CHẤP NHẬN: Chrome 109 (mục tiêu chính)
 *  hỗ trợ đủ, và không công cụ nào hạ cấp được. Chỉ báo để không quên. */
const CSS_WARN: [string, RegExp, number][] = [
  ["@layer", /@layer[\s{]/, 99],
  [":has()", /:has\(/, 105],
  ["translate:/rotate:/scale:", /[{;]\s*(translate|rotate|scale)\s*:/, 104],
  ["dvh/svh/lvh", /\d(dvh|svh|lvh|dvw|svw|lvw)(?![\w-])/, 108],
];

/** API mà esbuild KHÔNG bắt được (nó chỉ kiểm cú pháp, không kiểm runtime API). */
const JS_BLOCK: [string, RegExp, number][] = [
  [".toSorted/.toReversed/.toSpliced", /\.(toSorted|toReversed|toSpliced)\s*\(/, 110],
  ["Array.prototype.with", /\)\.with\s*\(/, 110],
  ["String.isWellFormed", /\.(isWellFormed|toWellFormed)\s*\(/, 111],
  ["Object.groupBy/Map.groupBy", /\b(Object|Map)\.groupBy\b/, 117],
  ["Promise.withResolvers", /\bPromise\.withResolvers\b/, 119],
  ["Array.fromAsync", /\bArray\.fromAsync\b/, 121],
  ["Set methods (union/intersection/…)", /\.(union|intersection|difference|symmetricDifference|isSubsetOf|isSupersetOf|isDisjointFrom)\s*\(/, 122],
  ["RegExp.escape", /\bRegExp\.escape\b/, 136],
  ["Popover API", /\.(showPopover|hidePopover|togglePopover)\s*\(/, 114],
  ["startViewTransition", /\.startViewTransition\s*\(/, 111],
  ["moveBefore", /\.moveBefore\s*\(/, 133],
  ["AbortSignal.any", /\bAbortSignal\.any\b/, 116],
];

// ---------------------------------------------------------------------------
// Quét CSS có nhận biết @supports + fallback cùng rule
// ---------------------------------------------------------------------------

type Finding = { file: string; line: number; kind: string; detail: string; level: "ERR" | "WARN" };

const lineOf = (code: string, idx: number) => code.slice(0, idx).split("\n").length;

/**
 * Với mỗi lần xuất hiện hàm màu, xác định nó có fallback hay không.
 * - guarded: nằm trong @supports có nhắc đúng tên hàm đó
 * - shadowed: cùng property đã được khai báo trước đó trong cùng rule
 */
function scanColorFns(code: string, file: string): Finding[] {
  const hits = [...code.matchAll(COLOR_FN_RE)].map((m) => ({ idx: m.index!, fn: m[1]! }));
  if (!hits.length) return [];

  const out: Finding[] = [];
  const stack: { prelude: string; props: string[] }[] = [];
  let runStart = 0;
  let quote = "";
  let h = 0;

  for (let i = 0; i < code.length && h < hits.length; i++) {
    while (h < hits.length && hits[h]!.idx === i) {
      const { fn } = hits[h]!;
      const decl = code.slice(runStart, i);
      // Hàm màu nằm trong prelude của at-rule (`@supports (color:lab(0% 0 0))`)
      // là điều kiện feature-test, không phải khai báo -> bỏ qua.
      if (decl.trimStart().startsWith("@")) { h++; continue; }
      const prop = decl.slice(0, decl.indexOf(":")).trim();
      const block = stack[stack.length - 1];
      const guarded = stack.some((s) => s.prelude.includes(`${fn}(`));
      const shadowed = !!prop && !!block?.props.includes(prop);

      if (MUST_BE_GONE.has(fn)) {
        out.push({ file, line: lineOf(code, i), kind: `${fn}()`, level: "ERR",
          detail: "lightningcss hạ cấp được — còn sót nghĩa là file chưa qua minifyCss có targets" });
      } else if (!guarded && !shadowed) {
        out.push({ file, line: lineOf(code, i), kind: `${fn}()`, level: "ERR",
          detail: `không có @supports bọc, cũng không có fallback "${prop || "?"}" đứng trước trong cùng rule` });
      }
      h++;
    }

    const c = code[i]!;
    if (quote) { if (c === quote && code[i - 1] !== "\\") quote = ""; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "{") { stack.push({ prelude: code.slice(runStart, i).trim(), props: [] }); runStart = i + 1; }
    else if (c === "}") { stack.pop(); runStart = i + 1; }
    else if (c === ";") {
      const decl = code.slice(runStart, i);
      const p = decl.slice(0, decl.indexOf(":")).trim();
      if (p && stack.length) stack[stack.length - 1]!.props.push(p);
      runStart = i + 1;
    }
  }
  return out;
}

function checkCss(code: string, file: string): Finding[] {
  const out: Finding[] = [...scanColorFns(code, file)];
  for (const [kind, re] of CSS_BLOCK) {
    const m = re.exec(code);
    if (m) out.push({ file, line: lineOf(code, m.index), kind, level: "ERR",
      detail: `không hạ cấp được, phải bỏ khỏi source: ${JSON.stringify(m[0].slice(0, 40))}` });
  }
  for (const [kind, re, chrome] of CSS_WARN) {
    const all = [...code.matchAll(new RegExp(re.source, re.flags + "g"))];
    if (all.length) out.push({ file, line: lineOf(code, all[0]!.index!), kind, level: "WARN",
      detail: `${all.length} chỗ, cần Chrome ${chrome}+ (Chrome 109 vẫn chạy được)` });
  }
  return out;
}

async function checkJs(code: string, file: string): Promise<Finding[]> {
  const out: Finding[] = [];
  try {
    await esbuild.transform(code, { loader: "js", sourcefile: file, target: JS_TARGET as string[] });
  } catch (e) {
    out.push({ file, line: 0, kind: "cú pháp", level: "ERR", detail: String((e as Error).message).split("\n")[0]! });
  }
  for (const [kind, re, chrome] of JS_BLOCK) {
    const m = re.exec(code);
    if (m) out.push({ file, line: lineOf(code, m.index), kind, level: "ERR",
      detail: `API cần Chrome ${chrome}+: ${JSON.stringify(m[0].slice(0, 40))}` });
  }
  return out;
}

// ---------------------------------------------------------------------------

async function* walk(dir: string): AsyncGenerator<string> {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");
const root = args.find((a) => !a.startsWith("--")) ?? "encode";

const findings: Finding[] = [];
let nCss = 0, nJs = 0;

for await (const path of walk(root)) {
  const rel = relative(process.cwd(), path);
  // source.css là input của Tailwind, không được phát hành -> bỏ qua.
  if (rel.endsWith("source.css")) continue;
  if (rel.endsWith(".css")) { nCss++; findings.push(...checkCss(await readFile(path, "utf8"), rel)); }
  else if (/\.(js|mjs|cjs)$/.test(rel)) { nJs++; findings.push(...await checkJs(await readFile(path, "utf8"), rel)); }
}

const errors = findings.filter((f) => f.level === "ERR");
const warns = findings.filter((f) => f.level === "WARN");

for (const f of [...errors, ...warns]) {
  console.log(`${f.level === "ERR" ? "✗" : "!"} ${f.file}:${f.line}  ${f.kind}  — ${f.detail}`);
}

const byKind = (list: Finding[]) =>
  [...list.reduce((m, f) => m.set(f.kind, (m.get(f.kind) ?? 0) + 1), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join(", ");

console.log(`\n${root}/: ${nCss} css, ${nJs} js  →  ${errors.length} lỗi, ${warns.length} cảnh báo`);
if (warns.length) console.log(`  cảnh báo: ${byKind(warns)}`);
if (errors.length) console.log(`  lỗi:      ${byKind(errors)}`);

process.exit(errors.length && !warnOnly ? 1 : 0);
