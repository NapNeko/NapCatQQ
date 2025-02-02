import './init-dynamic-dirname';
import { WebUiConfig } from '@/webui';
import { AuthHelper } from '../helper/SignToken';
import { LogWrapper } from '@/common/log';
import { WebSocket, WebSocketServer } from 'ws';
import os from 'os';
import { type IPty, spawn as ptySpawn } from '@homebridge/node-pty-prebuilt-multiarch';
import { randomUUID } from 'crypto';

interface TerminalInstance {
    pty: IPty; // 改用 PTY 实例
    lastAccess: number;
    sockets: Set<WebSocket>;
    // 新增标识，用于防止重复关闭
    isClosing: boolean;
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

                const dataHandler = (data: string) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'output', data }));
                    }
                };

                instance.sockets.add(ws);
                instance.lastAccess = Date.now();

                ws.on('message', (data) => {
                    if (instance) {
                        const result = JSON.parse(data.toString());
                        if (result.type === 'input') {
                            instance.pty.write(result.data);
                        }
                    }
                });

                ws.on('close', () => {
                    instance.sockets.delete(ws);
                    if (instance.sockets.size === 0 && !instance.isClosing) {
                        instance.isClosing = true;
                        instance.pty.kill();
                    }
                });
            } catch (err) {
                console.error('WebSocket authentication failed:', err);
                ws.close();
            }
        });
    }

    // 修改：移除参数 id，使用 crypto.randomUUID 生成终端 id
    createTerminal() {
        const id = randomUUID();
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const pty = ptySpawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.cwd(),
            env: {
                ...process.env,
                // 统一编码设置
                LANG: os.platform() === 'win32' ? 'chcp 65001' : 'zh_CN.UTF-8',
                TERM: 'xterm-256color',
            },
        });

        const instance: TerminalInstance = {
            pty,
            lastAccess: Date.now(),
            sockets: new Set(),
            isClosing: false,
        };

        pty.onData((data: any) => {
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
                instance.pty.kill();
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
