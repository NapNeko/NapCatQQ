import { WebUiConfig } from '@/webui';
import { AuthHelper } from '../helper/SignToken';
import { spawn, type ChildProcess } from 'child_process';
import * as os from 'os';
import { WebSocket, WebSocketServer } from 'ws';

interface TerminalInstance {
    process: ChildProcess;
    lastAccess: number;
    dataHandlers: Set<(data: string) => void>;
}

class TerminalManager {
    private terminals: Map<string, TerminalInstance> = new Map();
    private wss: WebSocketServer | null = null;

    initialize(server: any) {
        this.wss = new WebSocketServer({
            server,
            path: '/api/ws/terminal',
        });

        this.wss.on('connection', async (ws, req) => {
            try {
                const url = new URL(req.url || '', 'ws://localhost');
                const token = url.searchParams.get('token');
                const terminalId = url.searchParams.get('id');

                if (!token || !terminalId) {
                    ws.close();
                    return;
                }

                // 验证 token
                // 解析token
                let Credential: WebUiCredentialJson;
                try {
                    Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
                } catch (e) {
                    ws.close();
                    return;
                }
                const config = await WebUiConfig.GetWebUIConfig();
                const validate = AuthHelper.validateCredentialWithinOneHour(config.token, Credential);

                if (!validate) {
                    ws.close();
                    return;
                }

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
                instance.dataHandlers.add(dataHandler);

                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        if (data.type === 'input') {
                            this.writeTerminal(terminalId, data.data);
                        }
                    } catch (error) {
                        console.error('Failed to process terminal input:', error);
                    }
                });

                ws.on('close', () => {
                    instance.dataHandlers.delete(dataHandler);
                });
            } catch (err) {
                console.error('WebSocket authentication failed:', err);
                ws.close();
            }
        });
    }

    createTerminal(id: string) {
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        const shellProcess = spawn(shell, [], {
            env: process.env,
            shell: true,
        });

        const instance: TerminalInstance = {
            process: shellProcess,
            lastAccess: Date.now(),
            dataHandlers: new Set(),
        };

        // 修改这里，使用 shellProcess 而不是 process
        shellProcess.stdout.on('data', (data) => {
            const str = data.toString();
            instance.dataHandlers.forEach((handler) => handler(str));
        });

        shellProcess.stderr.on('data', (data) => {
            const str = data.toString();
            instance.dataHandlers.forEach((handler) => handler(str));
        });

        this.terminals.set(id, instance);
        return instance;
    }

    getTerminal(id: string) {
        return this.terminals.get(id);
    }

    closeTerminal(id: string) {
        const instance = this.terminals.get(id);
        if (instance) {
            instance.process.kill();
            this.terminals.delete(id);
        }
    }

    onTerminalData(id: string, handler: (data: string) => void) {
        const instance = this.terminals.get(id);
        if (instance) {
            instance.dataHandlers.add(handler);
            return () => {
                instance.dataHandlers.delete(handler);
            };
        }
        return () => {};
    }

    writeTerminal(id: string, data: string) {
        const instance = this.terminals.get(id);
        if (instance && instance.process.stdin) {
            instance.process.stdin.write(data, (error) => {
                if (error) {
                    console.error('Failed to write to terminal:', error);
                }
            });
        }
    }

    getTerminalList() {
        return Array.from(this.terminals.keys()).map((id) => ({
            id,
            lastAccess: this.terminals.get(id)!.lastAccess,
        }));
    }
}

export const terminalManager = new TerminalManager();
