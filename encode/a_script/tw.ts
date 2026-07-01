import { readdir, stat } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

const TAILWIND_BIN = resolve(process.cwd(), "node_modules/.bin/tailwindcss");

type Target = { input: string; output: string; label: string };

async function hasSource(folder: string) {
    try {
        await stat(join(folder, "source.css"));
        return true;
    } catch {
        return false;
    }
}

function toTarget(folder: string): Target {
    return {
        input: join(folder, "source.css"),
        output: join(folder, "output.css"),
        label: relative(process.cwd(), folder) || basename(folder),
    };
}

// Nếu chính folder được truyền vào có source.css -> watch đúng folder đó.
// Ngược lại, quét các thư mục con (1 cấp) có source.css.
async function findSources(folder: string): Promise<Target[]> {
    if (await hasSource(folder)) {
        return [toTarget(folder)];
    }

    const entries = await readdir(folder);
    const targets: Target[] = [];

    for (const entry of entries) {
        const subPath = join(folder, entry);
        const subStat = await stat(subPath);
        if (!subStat.isDirectory()) continue;
        if (await hasSource(subPath)) targets.push(toTarget(subPath));
    }

    return targets;
}

async function main() {
    // Bỏ qua các cờ (vd --build) để lấy tham số vị trí
    const positional = process.argv.slice(2).filter((a: string) => !a.startsWith("--"));
    const inputPath = positional[0];
    const isBuild = process.argv.includes("--build");

    if (!inputPath) {
        console.warn("Vui lòng cung cấp đường dẫn folder. Ví dụ: bun a_script/tw.ts home");
        console.warn("Watch đúng 1 thư mục: bun a_script/tw.ts home/desktop");
        console.warn("Thêm --build để compile 1 lần (mặc định là watch).");
        process.exit(1);
    }

    const folder = resolve(process.cwd(), inputPath);

    try {
        const folderStat = await stat(folder);
        if (!folderStat.isDirectory()) {
            console.error(`Lỗi: "${inputPath}" không phải là folder.`);
            process.exit(1);
        }
    } catch {
        console.error(`Lỗi: không tìm thấy folder "${inputPath}".`);
        process.exit(1);
    }

    const targets = await findSources(folder);

    if (targets.length === 0) {
        console.warn(`Không tìm thấy source.css trong "${inputPath}" hoặc thư mục con của nó.`);
        process.exit(1);
    }

    console.log(`\n--- Tailwind ${isBuild ? "build" : "watch"}: ${inputPath} ---`);
    for (const t of targets) {
        console.log(`  • ${t.label}: ${t.input} → ${t.output}`);
    }
    console.log("");

    const procs = targets.map((t) => {
        const args = ["-i", t.input, "-o", t.output];
        if (!isBuild) args.push("--watch");
        return Bun.spawn([TAILWIND_BIN, ...args], {
            stdin: "inherit",
            stdout: "inherit",
            stderr: "inherit",
        });
    });

    // Dừng tất cả tiến trình con khi nhấn Ctrl+C
    process.on("SIGINT", () => {
        for (const p of procs) p.kill();
        process.exit(0);
    });

    await Promise.all(procs.map((p) => p.exited));
}

main();
