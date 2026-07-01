import { test, expect, afterAll } from "bun:test";
import * as esbuild from "esbuild";
import { minifyJs, minifyCss, minifyHtml } from "./minify.ts";

afterAll(async () => {
  await esbuild.stop();
});

test("minifyJs: nén, giữ tên hàm global, vẫn parse được", async () => {
  const src = `function initHeader(){ var count = 0; document.addEventListener("click", function(){ count++; }); }\nvar GLOBAL_FLAG = true;\ninitHeader();`;
  const out = await minifyJs(src, "x.js");
  expect(out.length).toBeLessThan(src.length);
  expect(out).toContain("initHeader"); // tên global phải còn (được tham chiếu từ HTML/file khác)
  expect(out).toContain("GLOBAL_FLAG");
  // parse lại không lỗi
  await esbuild.transform(out, { loader: "js" });
});

test("minifyJs: giữ nguyên import ES module (không bundle)", async () => {
  const src = `import Swiper from "./vendor/swiper-bundle.mjs";\nexport const Helper = { run(){ return new Swiper(); } };`;
  const out = await minifyJs(src, "m.js");
  expect(out).toContain('"./vendor/swiper-bundle.mjs"'); // path tương đối giữ nguyên
  expect(out).toContain("import");
  expect(out).toContain("export");
});

test("minifyCss: nén màu + khoảng trắng", () => {
  const out = minifyCss(".box{ color:#ffffff; margin:0px 0px 0px 0px; }", "x.css");
  expect(out).toBe(".box{color:#fff;margin:0}");
});

test("minifyCss: tailwind source bị từ chối (để copy nguyên trạng)", () => {
  expect(() => minifyCss('@import "tailwindcss";\n.a{ @apply flex; }', "source.css")).toThrow(
    "tailwind-source",
  );
});

test("minifyHtml: nén, giữ type=module", async () => {
  const src = `<!doctype html>\n<html>\n  <head>\n    <!-- comment -->\n  </head>\n  <body>\n    <h1>Hi</h1>\n    <script type="module">const a = { b: { c: 1 }};</script>\n  </body>\n</html>`;
  const out = await minifyHtml(src, "i.html");
  expect(out.length).toBeLessThan(src.length);
  expect(out).toContain('type="module"');
  expect(out).not.toContain("<!-- comment -->");
});

test("minifyHtml: KHÔNG nhầm '}}' của JS lồng object là server-template", async () => {
  const src = `<html><body><script>var x = {a:{b:1}};</script></body></html>`;
  // không throw -> được minify bình thường
  const out = await minifyHtml(src, "i.html");
  expect(out).toContain("script");
});

test("minifyHtml: cặp {{ }} thật (Handlebars/Vue) bị từ chối để copy nguyên trạng", async () => {
  const src = `<html><body><p>{{ user.name }}</p></body></html>`;
  expect(minifyHtml(src, "i.html")).rejects.toThrow("server-template");
});
