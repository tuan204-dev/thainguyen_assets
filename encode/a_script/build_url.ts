import { readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const baseURL = "https://r2-thainguyen.media-soft.cloud";

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

// Copy vào clipboard, trả về cách đã dùng. Máy tại chỗ: lệnh nào có thì dùng (pbcopy macOS ·
// clip Windows · wl-copy/xclip/xsel Linux). Qua SSH clipboard của server không phải của mình nên
// nhờ terminal phía máy mình copy bằng OSC 52; trong tmux thì OSC 52 của app bị chặn
// (set-clipboard mặc định external) nên nhờ `tmux load-buffer -w` gửi hộ.
function copyToClipboard(text: string) {
    const cmds: string[][] = [];
    if (!process.env.SSH_CONNECTION)
        cmds.push(
            ["pbcopy"],
            ["clip"],
            ["wl-copy"],
            ["xclip", "-selection", "clipboard"],
            ["xsel", "--clipboard", "--input"],
        );
    if (process.env.TMUX) cmds.push(["tmux", "load-buffer", "-w", "-"]);

    for (const cmd of cmds) {
        try {
            // stdout/stderr phải "ignore": xclip/xsel/wl-copy fork tiến trình nền giữ pipe → treo
            const { success } = Bun.spawnSync(cmd, {
                stdin: Buffer.from(text),
                stdout: "ignore",
                stderr: "ignore",
            });
            if (success) return cmd[0];
        } catch {} // máy không có lệnh này
    }

    process.stdout.write(`\x1b]52;c;${Buffer.from(text).toString("base64")}\x07`);
    return "OSC 52";
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
                    const via = copyToClipboard(targetURL);
                    console.log(`\n✅ Đã copy (${via}): ${targetURL}`);
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
