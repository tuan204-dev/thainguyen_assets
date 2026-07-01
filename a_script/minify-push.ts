/**
 * minify-push.ts — Minify assets vào encode/ rồi git add + commit + push.
 *
 * Dùng:
 *   bun run minify:push                # commit message mặc định (kèm timestamp)
 *   bun run minify:push "message"      # commit message tùy chọn
 *
 * - Chạy a_script/minify.ts trước; minify LỖI thì DỪNG, không commit/push.
 * - Không có thay đổi nào để commit → bỏ qua commit, vẫn thử push (an toàn).
 */
import { $ } from "bun";

const customMsg = process.argv.slice(2).join(" ").trim();

// 1) Minify (lỗi -> throw -> dừng trước khi commit)
console.log("🔧 Đang minify…");
await $`bun ${import.meta.dir}/minify.ts`;

// 2) Stage toàn bộ thay đổi
await $`git add -A`;

// 3) Commit (bỏ qua nếu không có gì được stage)
const staged = (await $`git diff --cached --name-only`.text()).trim();
if (!staged) {
  console.log("ℹ️  Không có thay đổi để commit — bỏ qua.");
} else {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const msg = customMsg || `chore(assets): minify + sync encode/ (${stamp} UTC)`;
  await $`git commit -m ${msg}`;
  console.log(`✅ Đã commit ${staged.split("\n").length} file — "${msg}"`);
}

// 4) Push
console.log("⬆️  Đang push…");
await $`git push`;
console.log("🎉 Xong.");
