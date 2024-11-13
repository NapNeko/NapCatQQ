import { PacketContext } from "@/core/packet/context/packetContext";
import { IPacketClient } from "@/core/packet/client/baseClient";
import { NativePacketClient } from "@/core/packet/client/nativeClient";
import { wsPacketClient } from "@/core/packet/client/wsClient";
import { OidbPacket } from "@/core/packet/transformer/base";
import { PacketLogger } from "@/core/packet/context/loggerContext";

type clientPriority = {
    [key: number]: (context: PacketContext, logStack: LogStack) => IPacketClient;
}

const clientPriority: clientPriority = {
    10: (context: PacketContext, logStack: LogStack) => new NativePacketClient(context, logStack),
    1: (context: PacketContext, logStack: LogStack) => new wsPacketClient(context, logStack),
};

export class LogStack {
    private stack: string[] = [];
    private logger: PacketLogger;

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
    private readonly context: PacketContext;
    private readonly logStack: LogStack;
    private readonly _client: IPacketClient;

    constructor(context: PacketContext) {
        this.context = context;
        this.logStack = new LogStack(context.logger);
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
        return (rsp ? Buffer.from(raw.hex_data, "hex") : undefined) as T extends true ? Buffer : void;
    }

    private newClient(): IPacketClient {
        const prefer = this.context.napcore.config.packetBackend;
        let client: IPacketClient | null;
        switch (prefer) {
        case "native":
            this.context.logger.info("使用指定的 NativePacketClient 作为后端");
            client = new NativePacketClient(this.context, this.logStack);
            break;
        case "frida":
            this.context.logger.info("[Core] [Packet] 使用指定的 FridaPacketClient 作为后端");
            client = new wsPacketClient(this.context, this.logStack);
            break;
        case "auto":
        case undefined:
            client = this.judgeClient();
            break;
        default:
            this.context.logger.error(`未知的PacketBackend ${prefer}，请检查配置文件！`);
            client = null;
        }
        if (!(client && client.check())) {
            throw new Error("[Core] [Packet] 无可用的后端，NapCat.Packet将不会加载！");
        }
        return client;
    }

    private judgeClient(): IPacketClient {
        const sortedClients = Object.entries(clientPriority)
            .map(([priority, clientFactory]) => {
                const client = clientFactory(this.context, this.logStack);
                const score = +priority * +client.check();
                return { client, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score);
        const selectedClient = sortedClients[0]?.client;
        if (!selectedClient) {
            throw new Error("[Core] [Packet] 无可用的后端，NapCat.Packet将不会加载！");
        }
        this.context.logger.info(`自动选择 ${selectedClient.constructor.name} 作为后端`);
        return selectedClient;
    }
}
