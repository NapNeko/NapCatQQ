import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { constants } from 'node:os';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import { OidbPacket, PacketBuf } from '@/core/packet/transformer/base';
export interface RecvPacket {
    type: string, // 仅recv
    data: RecvPacketData
}

export interface RecvPacketData {
    seq: number
    cmd: string
    data: Buffer
}

// 0 send 1 recv
export interface NativePacketExportType {
    initHook?: (send: string, recv: string) => boolean;
}

export class NativePacketClient {
    protected readonly napcore: NapCoreContext;
    protected readonly logger: PacketLogger;
    protected readonly cb = new Map<string, (json: RecvPacketData) => Promise<any> | any>(); // hash-type callback
    logStack: LogStack;
    available: boolean = false;
    private readonly supportedPlatforms = ['win32.x64', 'linux.x64', 'linux.arm64', 'darwin.x64', 'darwin.arm64'];
    private readonly MoeHooExport: { exports: NativePacketExportType } = { exports: {} };

    constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        this.napcore = napCore;
        this.logger = logger;
        this.logStack = logStack;
    }

    check(): boolean {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            this.logStack.pushLogWarn(`NativePacketClient: 不支持的平台: ${platform}`);
            return false;
        }
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './native/napi2native/napi2native.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            this.logStack.pushLogWarn(`NativePacketClient: 缺失运行时文件: ${moehoo_path}`);
            return false;
        }
        return true;
    }

    async init(_pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        const isNewQQ = this.napcore.basicInfo.requireMinNTQQBuild("40824");
        if (isNewQQ) {
            const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './native/napi2native/napi2native.' + platform + '.node');
            process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
            this.MoeHooExport?.exports.initHook?.(send, recv);
            this.available = true;
        }
    }

    async sendPacket(
        cmd: string,
        data: PacketBuf,
        rsp = false,
        timeout = 5000
    ): Promise<RecvPacketData> {
        if (!rsp) {
            this.napcore
                .sendSsoCmdReqByContend(cmd, data)
                .catch(err =>
                    this.logger.error(
                        `[PacketClient] sendPacket 无响应命令发送失败 cmd=${cmd} err=${err}`
                    )
                );
            return { seq: 0, cmd, data: Buffer.alloc(0) };
        }

        const sendPromise = this.napcore
            .sendSsoCmdReqByContend(cmd, data)
            .then(ret => ({
                seq: 0,
                cmd,
                data: (ret as { rspbuffer: Buffer }).rspbuffer
            }));

        const timeoutPromise = new Promise<RecvPacketData>((_, reject) => {
            setTimeout(
                () =>
                    reject(
                        new Error(
                            `[PacketClient] sendPacket 超时 cmd=${cmd} timeout=${timeout}ms`
                        )
                    ),
                timeout
            );
        });

        return Promise.race([sendPromise, timeoutPromise]);
    }
    async sendOidbPacket(pkt: OidbPacket, rsp = false, timeout = 5000): Promise<RecvPacketData> {
        return await this.sendPacket(pkt.cmd, pkt.data, rsp, timeout);
    }
}
