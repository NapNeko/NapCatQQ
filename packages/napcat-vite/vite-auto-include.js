import path from 'path';
import fs from 'fs';

export function autoIncludeTSPlugin(options) {
    // options: { entries: [{ entry: 'napcat.ts', dir: './utils' }, ...] }
    const { entries } = options;
    let tsFilesMap = {};

    return {
        name: 'vite-auto-include',

        async buildStart() {
            tsFilesMap = {};
            for (const { entry, dir } of entries) {
                const fullDir = path.resolve(dir);
                const allTsFiles = await findTSFiles(fullDir);

                const validFiles = [];
                allTsFiles.forEach((filePath) => {
                    try {
                        const source = fs.readFileSync(filePath, 'utf-8');
                        if (source && source.trim() !== '') {
                            validFiles.push(filePath);
                        } else {
                            // Skipping empty file: ${filePath}
                        }
                    } catch (error) {
                        console.error(`Error reading file: ${filePath}`, error);
                    }
                });

                tsFilesMap[entry] = validFiles;
            }
        },

        transform(code, id) {
            for (const [entry, tsFiles] of Object.entries(tsFilesMap)) {
                const isMatch = id.endsWith(entry) || id.includes(entry);
                if (isMatch && tsFiles.length > 0) {
                    const imports = tsFiles.map(filePath => {
                        const relativePath = path.relative(path.dirname(id), filePath).replace(/\\/g, '/');
                        return `import './${relativePath}';`;
                    }).join('\n');

                    const transformedCode = imports + '\n' + code;

                    return {
                        code: transformedCode,
                        map: { mappings: '' } // 空映射即可，VSCode 可以在 TS 上断点
                    };
                }
            }

            return null;
        },

    };
}

// 辅助函数：查找所有 .ts 文件
async function findTSFiles(dir) {
    const files = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });

    for (let item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...await findTSFiles(fullPath)); // 递归查找子目录
        } else if (item.isFile() && fullPath.endsWith('.ts')) {
            files.push(fullPath); // 收集 .ts 文件
        }
    }

    return files;
}
