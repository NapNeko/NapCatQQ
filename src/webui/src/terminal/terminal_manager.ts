import './init-dynamic-dirname';
import { WebUiConfig } from '@/webui';
import { AuthHelper } from '../helper/SignToken';
import { LogWrapper } from '@/common/log';
import { WebSocket, WebSocketServer } from 'ws';
import os from 'os';
import { IPty, spawn as ptySpawn } from '@/pty';
import { randomUUID } from 'crypto';

interface TerminalInstance {
    pty: IPty; // 改用 PTY 实例
    lastAccess: number;
    sockets: Set<WebSocket>;
    // 新增标识，用于防止重复关闭
    isClosing: boolean;
    // 新增：存储终端历史输出
    buffer: string;
}

class TerminalManager {
    private terminals: Map<string, TerminalInstance> = new Map();
    private wss: WebSocketServer | null = null;

    initialize(req: any, socket: any, head: any, logger?: LogWrapper) {
        logger?.log('[NapCat] [WebUi] terminal websocket initialized');
        this.wss = new WebSocketServer({
            noServer: true,
            verifyClient: async (info, cb) => {
                // 验证 token
                const url = new URL(info.req.url || '', 'ws://localhost');
                const token = url.searchParams.get('token');
                const terminalId = url.searchParams.get('id');

                if (!token || !terminalId) {
                    cb(false, 401, 'Unauthorized');
                    return;
                }

                // 解析token
                let Credential: WebUiCredentialJson;
                try {
                    Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
                } catch (e) {
                    cb(false, 401, 'Unauthorized');
                    return;
                }
                const config = await WebUiConfig.GetWebUIConfig();
                const validate = AuthHelper.validateCredentialWithinOneHour(config.token, Credential);
                if (!validate) {
                    cb(false, 401, 'Unauthorized');
                    return;
                }
                cb(true);
            },
        });
        this.wss.handleUpgrade(req, socket, head, (ws) => {
            this.wss?.emit('connection', ws, req);
        });
        this.wss.on('connection', async (ws, req) => {
            logger?.log('建立终端连接');
            try {
                const url = new URL(req.url || '', 'ws://localhost');
                const terminalId = url.searchParams.get('id')!;

                const instance = this.terminals.get(terminalId);

                if (!instance) {
                    ws.close();
                    return;
                }

                instance.sockets.add(ws);
                instance.lastAccess = Date.now();

                // 新增：发送当前终端内容给新连接
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'output', data: instance.buffer }));
                }

                ws.on('message', (data) => {
                    if (instance) {
                        const result = JSON.parse(data.toString());
                        if (result.type === 'input') {
                            instance.pty.write(result.data);
                        }
                        // 新增：处理 resize 消息
                        if (result.type === 'resize') {
                            instance.pty.resize(result.cols, result.rows);
                        }
                    }
                });

                ws.on('close', () => {
                    instance.sockets.delete(ws);
                    if (instance.sockets.size === 0 && !instance.isClosing) {
                        instance.isClosing = true;
                        if (os.platform() === 'win32') {
                            process.kill(instance.pty.pid);
                        } else {
                            instance.pty.kill();
                        }
                    }
                });
            } catch (err) {
                console.error('WebSocket authentication failed:', err);
                ws.close();
            }
        });
    }

    // 修改：新增 cols 和 rows 参数，同步 xterm 尺寸，防止错位
    createTerminal(cols: number, rows: number) {
        const id = randomUUID();
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const pty = ptySpawn(shell, [], {
            name: 'xterm-256color',
            cols, // 使用客户端传入的 cols
            rows, // 使用客户端传入的 rows
            cwd: process.cwd(),
            env: {
                ...process.env,
                LANG: os.platform() === 'win32' ? 'chcp 65001' : 'zh_CN.UTF-8',
                TERM: 'xterm-256color',
            },
        });

        const instance: TerminalInstance = {
            pty,
            lastAccess: Date.now(),
            sockets: new Set(),
            isClosing: false,
            buffer: '', // 初始化终端内容缓存
        };

        pty.onData((data: any) => {
            // 追加数据到 buffer
            instance.buffer += data;
            // 发送数据给已连接的 websocket
            instance.sockets.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'output', data }));
                }
            });
        });

        pty.onExit(() => {
            this.closeTerminal(id);
        });

        this.terminals.set(id, instance);
        // 返回生成的 id 及对应实例，方便后续通知客户端使用该 id
        return { id, instance };
    }

    closeTerminal(id: string) {
        const instance = this.terminals.get(id);
        if (instance) {
            if (!instance.isClosing) {
                instance.isClosing = true;
                if (os.platform() === 'win32') {
                    process.kill(instance.pty.pid);
                } else {
                    instance.pty.kill();
                }
            }
            instance.sockets.forEach((ws) => ws.close());
            this.terminals.delete(id);
        }
    }

    getTerminal(id: string) {
        return this.terminals.get(id);
    }

    getTerminalList() {
        return Array.from(this.terminals.keys()).map((id) => ({
            id,
            lastAccess: this.terminals.get(id)!.lastAccess,
        }));
    }
}

export const terminalManager = new TerminalManager();
