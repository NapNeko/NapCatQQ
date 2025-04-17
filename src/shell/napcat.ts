import { NCoreInitShell } from './base';
import * as net from 'net';
import * as process from 'process';
if (process.platform === 'win32') {
    const pid = process.pid;
    const pipePath = `\\\\.\\pipe\\NapCat_${pid}`;
    try {
        const pipeSocket = net.connect(pipePath, () => {
            console.log(`已连接到命名管道: ${pipePath}`);
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
            console.log(`stdout 已重定向到命名管道: ${pipePath}`);
        });

        pipeSocket.on('error', (err) => {
            console.log(`连接命名管道 ${pipePath} 时出错:`, err);
        });

        pipeSocket.on('end', () => {
            console.log('命名管道连接已关闭');
        });

    } catch (error) {
        console.log(`尝试连接命名管道 ${pipePath} 时发生异常:`, error);
    }
}
NCoreInitShell();