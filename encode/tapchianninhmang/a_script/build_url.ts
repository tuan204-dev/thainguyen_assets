import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const baseURL = "https://assets.tapchianninhmang.vn";

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = await readdir(dirPath);

    for (const file of files) {
        const fullPath = join(dirPath, file);
        const fileStat = await stat(fullPath);

        if (fileStat.isDirectory()) {
            await getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    }

    return arrayOfFiles;
}

async function main() {
    const inputPath = process.argv[2];

    if (!inputPath) {
        console.warn(
            "Vui lòng cung cấp đường dẫn folder hoặc file. Ví dụ: bun a_script/build_url.ts mobile",
        );
        process.exit(1);
    }

    const absolutePath = resolve(process.cwd(), inputPath);
    const projectRoot = process.cwd();

    try {
        const pathStat = await stat(absolutePath);
        let files: string[] = [];

        if (pathStat.isDirectory()) {
            files = await getAllFiles(absolutePath);
        } else {
            files = [absolutePath];
        }

        console.log("\n--- Danh sách URL ---\n");

        const urlList: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (typeof file === "string") {
                const relativePath = relative(projectRoot, file);
                const urlPath = relativePath.split(/[\\/]/).join("/");
                const fullURL = `${baseURL}/${urlPath}`;
                urlList.push(fullURL);
                // Chỉ log ra relative path để gọn terminal
                console.log(`[${i + 1}] ${urlPath}`);
            }
        }

        console.log(`\n--- Tổng cộng: ${files.length} items ---\n`);

        if (files.length > 0) {
            const selection = prompt("Nhập số thứ tự để COPY URL (hoặc Enter để thoát):");
            if (selection) {
                const index = parseInt(selection) - 1;
                if (urlList[index]) {
                    const targetURL = urlList[index];
                    // Sử dụng lệnh pbcopy trên macOS để copy vào clipboard
                    const proc = Bun.spawn(["pbcopy"], {
                        stdin: "pipe",
                    });
                    proc.stdin.write(targetURL);
                    proc.stdin.end();
                    console.log(`\n✅ Đã copy: ${targetURL}`);
                } else {
                    console.log("\n❌ Lựa chọn không hợp lệ.");
                }
            }
        }
    } catch (error: any) {
        console.error(`Lỗi: ${error.message}`);
        process.exit(1);
    }
}

main();
