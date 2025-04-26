import { LogWrapper } from '@/common/log';
import * as net from 'net';
import * as process from 'process';

/**
 * 连接到命名管道并重定向stdout
 * @param logger 日志记录器
 * @param timeoutMs 连接超时时间(毫秒)，默认5000ms
 * @returns Promise，连接成功时resolve，失败时reject
 */
export function connectToNamedPipe(logger: LogWrapper, timeoutMs: number = 5000): Promise<{ disconnect: () => void }> {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') {
            logger.log('只有Windows平台支持命名管道');
            // 非Windows平台不reject，而是返回一个空的disconnect函数
            return resolve({ disconnect: () => { } });
        }

        const pid = process.pid;
        const pipePath = `\\\\.\\pipe\\NapCat_${pid}`;

        // 设置连接超时
        const timeoutId = setTimeout(() => {
            reject(new Error(`连接命名管道超时: ${pipePath}`));
        }, timeoutMs);

        try {
            let originalStdoutWrite = process.stdout.write.bind(process.stdout);
            const pipeSocket = net.connect(pipePath, () => {
                // 清除超时
                clearTimeout(timeoutId);

                logger.log(`[StdOut] 已重定向到命名管道: ${pipePath}`);
                process.stdout.write = (
                    chunk: any,
                    encoding?: BufferEncoding | (() => void),
                    cb?: () => void
                ): boolean => {
                    if (typeof encoding === 'function') {
                        cb = encoding;
                        encoding = undefined;
                    }
                    return pipeSocket.write(chunk, encoding as BufferEncoding, cb);
                };
                // 提供断开连接的方法
                const disconnect = () => {
                    process.stdout.write = originalStdoutWrite;
                    pipeSocket.end();
                    logger.log(`已手动断开命名管道连接: ${pipePath}`);
                };

                // 返回成功和断开连接的方法
                resolve({ disconnect });
            });

            pipeSocket.on('error', (err) => {
                clearTimeout(timeoutId);
                process.stdout.write = originalStdoutWrite;
                logger.log(`连接命名管道 ${pipePath} 时出错:`, err);
                reject(err);
            });

            pipeSocket.on('end', () => {
                process.stdout.write = originalStdoutWrite;
                logger.log('命名管道连接已关闭');
            });

        } catch (error) {
            clearTimeout(timeoutId);
            logger.log(`尝试连接命名管道 ${pipePath} 时发生异常:`, error);
            reject(error);
        }
    });
}