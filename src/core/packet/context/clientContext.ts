import { IPacketClient } from '@/core/packet/client/baseClient';
import { NativePacketClient } from '@/core/packet/client/nativeClient';
import { OidbPacket } from '@/core/packet/transformer/base';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';

type clientPriorityType = {
    [key: number]: (napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) => IPacketClient;
}

const clientPriority: clientPriorityType = {
    10: (napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) => new NativePacketClient(napCore, logger, logStack)
};

export class LogStack {
    private stack: string[] = [];
    private readonly logger: PacketLogger;

    constructor(logger: PacketLogger) {
        this.logger = logger;
    }

    push(msg: string) {
        this.stack.push(msg);
    }

    pushLogInfo(msg: string) {
        this.logger.info(msg);
        this.stack.push(`${new Date().toISOString()} [INFO] ${msg}`);
    }

    pushLogWarn(msg: string) {
        this.logger.warn(msg);
        this.stack.push(`${new Date().toISOString()} [WARN] ${msg}`);
    }

    pushLogError(msg: string) {
        this.logger.error(msg);
        this.stack.push(`${new Date().toISOString()} [ERROR] ${msg}`);
    }

    clear() {
        this.stack = [];
    }

    content() {
        return this.stack.join('\n');
    }
}

export class PacketClientContext {
    private readonly napCore: NapCoreContext;
    private readonly logger: PacketLogger;
    private readonly logStack: LogStack;
    private readonly _client: IPacketClient;

    constructor(napCore: NapCoreContext, logger: PacketLogger) {
        this.napCore = napCore;
        this.logger = logger;
        this.logStack = new LogStack(logger);
        this._client = this.newClient();
    }

    get available(): boolean {
        return this._client.available;
    }

    get clientLogStack(): string {
        return this._client.logStack.content();
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        await this._client.init(pid, recv, send);
    }

    async sendOidbPacket<T extends boolean = false>(pkt: OidbPacket, rsp?: T): Promise<T extends true ? Buffer : void> {
        const raw = await this._client.sendOidbPacket(pkt, rsp);
        return (rsp ? Buffer.from(raw.hex_data, 'hex') : undefined) as T extends true ? Buffer : void;
    }

    private newClient(): IPacketClient {
        const prefer = this.napCore.config.packetBackend;
        let client: IPacketClient | null;
        switch (prefer) {
        case 'native':
            this.logger.info('使用指定的 NativePacketClient 作为后端');
            client = new NativePacketClient(this.napCore, this.logger, this.logStack);
            break;
        case 'auto':
        case undefined:
            client = this.judgeClient();
            break;
        default:
            this.logger.error(`未知的PacketBackend ${prefer}，请检查配置文件！`);
            client = null;
        }
        if (!client?.check()) {
            throw new Error('[Core] [Packet] 无可用的后端，NapCat.Packet将不会加载！');
        }
        if (!client) {
            throw new Error('[Core] [Packet] 后端异常，NapCat.Packet将不会加载！');
        }
        return client;
    }

    private judgeClient(): IPacketClient {
        const sortedClients = Object.entries(clientPriority)
            .map(([priority, clientFactory]) => {
                const client = clientFactory(this.napCore, this.logger, this.logStack);
                const score = +priority * +client.check();
                return { client, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);
        const selectedClient = sortedClients[0]?.client;
        if (!selectedClient) {
            throw new Error('[Core] [Packet] 无可用的后端，NapCat.Packet将不会加载！');
        }
        this.logger.info(`自动选择 ${selectedClient.constructor.name} 作为后端`);
        return selectedClient;
    }
}
