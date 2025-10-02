// 更正导入语句
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as os from 'os';
import * as compressing from 'compressing';  // 修正导入方式
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { LogWrapper } from './log';

const downloadOri = "https://github.com/NapNeko/ffmpeg-build/releases/download/v1.0.0/ffmpeg-7.1.1-win64.zip"
const urls = [
    "https://j.1win.ggff.net/" + downloadOri,
    "https://git.yylx.win/" + downloadOri,
    "https://ghfile.geekertao.top/" + downloadOri,
    "https://gh-proxy.net/" + downloadOri,
    "https://ghm.078465.xyz/" + downloadOri,
    "https://gitproxy.127731.xyz/" + downloadOri,
    "https://jiashu.1win.eu.org/" + downloadOri,
    "https://github.tbedu.top/" + downloadOri,
    downloadOri
];

/**
 * 测试URL是否可用
 * @param url 待测试的URL
 * @returns 如果URL可访问返回true，否则返回false
 */
async function testUrl(url: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const req = https.get(url, { timeout: 5000 }, (res) => {
            // 检查状态码是否表示成功
            const statusCode = res.statusCode || 0;
            if (statusCode >= 200 && statusCode < 300) {
                // 终止请求并返回true
                req.destroy();
                resolve(true);
            } else {
                req.destroy();
                resolve(false);
            }
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

/**
 * 查找第一个可用的URL
 * @returns 返回第一个可用的URL，如果都不可用则返回null
 */
async function findAvailableUrl(): Promise<string | null> {
    for (const url of urls) {
        try {
            const available = await testUrl(url);
            if (available) {
                return url;
            }
        } catch (error) {
            // 忽略错误
        }
    }

    return null;
}
/**
 * 下载文件
 * @param url 下载URL
 * @param destPath 目标保存路径
 * @returns 成功返回true，失败返回false
 */
async function downloadFile(url: string, destPath: string, progressCallback?: (percent: number) => void): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const file = fs.createWriteStream(destPath);

        const req = https.get(url, (res) => {
            const statusCode = res.statusCode || 0;

            if (statusCode >= 200 && statusCode < 300) {
                // 获取文件总大小
                const totalSize = parseInt(res.headers['content-length'] || '0', 10);
                let downloadedSize = 0;
                let lastReportedPercent = -1; // 上次报告的百分比
                let lastReportTime = 0; // 上次报告的时间戳

                // 如果有内容长度和进度回调，则添加数据监听
                if (totalSize > 0 && progressCallback) {
                    // 初始报告 0%
                    progressCallback(0);
                    lastReportTime = Date.now();

                    res.on('data', (chunk) => {
                        downloadedSize += chunk.length;
                        const currentPercent = Math.floor((downloadedSize / totalSize) * 100);
                        const now = Date.now();

                        // 只在以下条件触发回调：
                        // 1. 百分比变化至少为1%
                        // 2. 距离上次报告至少500毫秒
                        // 3. 确保报告100%完成
                        if ((currentPercent !== lastReportedPercent &&
                            (currentPercent - lastReportedPercent >= 1 || currentPercent === 100)) &&
                            (now - lastReportTime >= 1000 || currentPercent === 100)) {

                            progressCallback(currentPercent);
                            lastReportedPercent = currentPercent;
                            lastReportTime = now;
                        }
                    });
                }

                pipeline(res, file)
                    .then(() => {
                        // 确保最后报告100%
                        if (progressCallback && lastReportedPercent !== 100) {
                            progressCallback(100);
                        }
                        resolve(true);
                    })
                    .catch(() => resolve(false));
            } else {
                file.close();
                fs.unlink(destPath, () => { });
                resolve(false);
            }
        });

        req.on('error', () => {
            file.close();
            fs.unlink(destPath, () => { });
            resolve(false);
        });
    });
}

/**
 * 解压缩zip文件中的特定内容
 * 只解压bin目录中的文件到目标目录
 * @param zipPath 压缩文件路径
 * @param extractDir 解压目标路径
 */
async function extractBinDirectory(zipPath: string, extractDir: string): Promise<void> {
    try {
        // 确保目标目录存在
        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir, { recursive: true });
        }

        // 解压文件
        const zipStream = new compressing.zip.UncompressStream({ source: zipPath });

        return new Promise<void>((resolve, reject) => {
            // 监听条目事件
            zipStream.on('entry', (header, stream, next) => {
                // 获取文件路径
                const filePath = header.name;

                // 匹配内层bin目录中的文件
                // 例如：ffmpeg-n7.1.1-6-g48c0f071d4-win64-lgpl-7.1/bin/ffmpeg.exe
                if (filePath.includes('/bin/') && filePath.endsWith('.exe')) {
                    // 提取文件名
                    const fileName = path.basename(filePath);
                    const targetPath = path.join(extractDir, fileName);

                    // 创建写入流
                    const writeStream = fs.createWriteStream(targetPath);

                    // 将流管道连接到文件
                    stream.pipe(writeStream);

                    // 监听写入完成事件
                    writeStream.on('finish', () => {
                        next();
                    });

                    writeStream.on('error', () => {
                        next();
                    });
                } else {
                    // 跳过不需要的文件
                    stream.resume();
                    next();
                }
            });

            zipStream.on('error', (err) => {
                reject(err);
            });

            zipStream.on('finish', () => {
                resolve();
            });
        });
    } catch (err) {
        throw err;
    }
}

/**
 * 下载并设置FFmpeg
 * @param destDir 目标安装目录，默认为用户临时目录下的ffmpeg文件夹
 * @param tempDir 临时文件目录，默认为系统临时目录
 * @returns 返回ffmpeg可执行文件的路径，如果失败则返回null
 */
export async function downloadFFmpeg(
    destDir?: string,
    tempDir?: string,
    progressCallback?: (percent: number, stage: string) => void
): Promise<string | null> {
    // 仅限Windows
    if (os.platform() !== 'win32') {
        return null;
    }

    const destinationDir = destDir || path.join(os.tmpdir(), 'ffmpeg');
    const tempDirectory = tempDir || os.tmpdir();
    const zipFilePath = path.join(tempDirectory, 'ffmpeg.zip'); // 临时下载到指定临时目录
    const ffmpegExePath = path.join(destinationDir, 'ffmpeg.exe');

    // 确保目录存在
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }

    // 确保临时目录存在
    if (!fs.existsSync(tempDirectory)) {
        fs.mkdirSync(tempDirectory, { recursive: true });
    }

    // 如果ffmpeg已经存在，直接返回路径
    if (fs.existsSync(ffmpegExePath)) {
        if (progressCallback) progressCallback(100, '已找到FFmpeg');
        return ffmpegExePath;
    }

    // 查找可用URL
    if (progressCallback) progressCallback(0, '查找可用下载源');
    const availableUrl = await findAvailableUrl();
    if (!availableUrl) {
        return null;
    }

    // 下载文件
    if (progressCallback) progressCallback(5, '开始下载FFmpeg');
    const downloaded = await downloadFile(
        availableUrl,
        zipFilePath,
        (percent) => {
            // 下载占总进度的70%
            if (progressCallback) progressCallback(5 + Math.floor(percent * 0.7), '下载FFmpeg');
        }
    );

    if (!downloaded) {
        return null;
    }

    try {
        // 直接解压bin目录文件到目标目录
        if (progressCallback) progressCallback(75, '解压FFmpeg');
        await extractBinDirectory(zipFilePath, destinationDir);

        // 清理下载文件
        if (progressCallback) progressCallback(95, '清理临时文件');
        try {
            fs.unlinkSync(zipFilePath);
        } catch (err) {
            // 忽略清理临时文件失败的错误
        }

        // 检查ffmpeg.exe是否成功解压
        if (fs.existsSync(ffmpegExePath)) {
            if (progressCallback) progressCallback(100, 'FFmpeg安装完成');
            return ffmpegExePath;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

/**
 * 检查系统PATH环境变量中是否存在指定可执行文件
 * @param executable 可执行文件名
 * @returns 如果找到返回完整路径，否则返回null
 */
function findExecutableInPath(executable: string): string | null {
    // 仅适用于Windows系统
    if (os.platform() !== 'win32') return null;

    // 获取PATH环境变量
    const pathEnv = process.env['PATH'] || '';
    const pathDirs = pathEnv.split(';');

    // 检查每个目录
    for (const dir of pathDirs) {
        if (!dir) continue;
        try {
            const filePath = path.join(dir, executable);
            if (fs.existsSync(filePath)) {
                return filePath;
            }
        } catch (error) {
            continue;
        }
    }

    return null;
}

export async function downloadFFmpegIfNotExists(log: LogWrapper) {
    // 仅限Windows
    if (os.platform() !== 'win32') {
        return {
            path: null,
            reset: false
        };
    }
    const ffmpegInPath = findExecutableInPath('ffmpeg.exe');
    const ffprobeInPath = findExecutableInPath('ffprobe.exe');

    if (ffmpegInPath && ffprobeInPath) {
        const ffmpegDir = path.dirname(ffmpegInPath);
        return {
            path: ffmpegDir,
            reset: true
        };
    }

    // 如果环境变量中没有，检查项目目录中是否存在
    const currentPath = path.dirname(fileURLToPath(import.meta.url));
    const ffmpeg_exist = fs.existsSync(path.join(currentPath, 'ffmpeg', 'ffmpeg.exe'));
    const ffprobe_exist = fs.existsSync(path.join(currentPath, 'ffmpeg', 'ffprobe.exe'));

    if (!ffmpeg_exist || !ffprobe_exist) {
        let url = await downloadFFmpeg(path.join(currentPath, 'ffmpeg'), path.join(currentPath, 'cache'), (percentage: number, message: string) => {
            log.log(`[FFmpeg] [Download] ${percentage}% - ${message}`);
        });
        if (!url) {
            log.log('[FFmpeg] [Error] 下载FFmpeg失败');
            return {
                path: null,
                reset: false
            };
        }
        return {
            path: path.join(currentPath, 'ffmpeg'),
            reset: true
        }
    }

    return {
        path: path.join(currentPath, 'ffmpeg'),
        reset: true
    }
}