import { LogWrapper } from '@/common/log';
import * as net from 'net';
import * as process from 'process';
import { Writable } from 'stream';

/**
 * 连接到命名管道并重定向stdout
 * @param logger 日志记录器
 * @param timeoutMs 连接超时时间(毫秒)，默认5000ms
 * @returns Promise，连接成功时resolve，失败时reject
 */
export function connectToNamedPipe(logger: LogWrapper, timeoutMs: number = 5000): Promise<{ disconnect: () => void }> {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') {
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
            const originalStdoutWrite = process.stdout.write.bind(process.stdout);
            const pipeSocket = net.connect(pipePath, () => {
                // 清除超时
                clearTimeout(timeoutId);

                // 优化网络性能设置
                pipeSocket.setNoDelay(true); // 减少延迟

                // 设置更高的高水位线，允许更多数据缓冲

                logger.log(`[StdOut] 已重定向到命名管道: ${pipePath}`);

                // 创建拥有更优雅背压处理的 Writable 流
                const pipeWritable = new Writable({
                    highWaterMark: 1024 * 64, // 64KB 高水位线
                    write(chunk, encoding, callback) {
                        if (!pipeSocket.writable) {
                            // 如果管道不可写，退回到原始stdout
                            logger.log('[StdOut] 管道不可写，回退到控制台输出');
                            return originalStdoutWrite(chunk, encoding, callback);
                        }

                        // 尝试写入数据到管道
                        const canContinue = pipeSocket.write(chunk, encoding, () => {
                            // 数据已被发送或放入内部缓冲区
                        });

                        if (canContinue) {
                            // 如果返回true，表示可以继续写入更多数据
                            // 立即通知写入流可以继续
                            process.nextTick(callback);
                        } else {
                            // 如果返回false，表示内部缓冲区已满
                            // 等待drain事件再恢复写入
                            pipeSocket.once('drain', () => {
                                callback();
                            });
                        }
                        // 明确返回true，表示写入已处理
                        return true;
                    }
                });

                // 重定向stdout
                process.stdout.write = (
                    chunk: any,
                    encoding?: BufferEncoding | (() => void),
                    cb?: () => void
                ): boolean => {
                    if (typeof encoding === 'function') {
                        cb = encoding;
                        encoding = undefined;
                    }

                    // 使用优化的writable流处理写入
                    return pipeWritable.write(chunk, encoding as BufferEncoding, cb as () => void);
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

            // 管道错误处理
            pipeSocket.on('error', (err) => {
                clearTimeout(timeoutId);
                process.stdout.write = originalStdoutWrite;
                logger.log(`连接命名管道 ${pipePath} 时出错:`, err);
                reject(err);
            });

            // 管道关闭处理
            pipeSocket.on('end', () => {
                process.stdout.write = originalStdoutWrite;
                logger.log('命名管道连接已关闭');
            });

            // 确保在连接意外关闭时恢复stdout
            pipeSocket.on('close', () => {
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