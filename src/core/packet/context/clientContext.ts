import { PacketContext } from "@/core/packet/context/packetContext";
import { IPacketClient } from "@/core/packet/client/baseClient";
import { NativePacketClient } from "@/core/packet/client/nativeClient";
import { wsPacketClient } from "@/core/packet/client/wsClient";
import { OidbPacket } from "@/core/packet/transformer/base";

type clientPriority = {
    [key: number]: (context: PacketContext) => IPacketClient;
}

const clientPriority: clientPriority = {
    10: (context: PacketContext) => new NativePacketClient(context),
    1: (context: PacketContext) => new wsPacketClient(context),
};

export class PacketClientContext {
    private readonly _client: IPacketClient;
    private readonly context: PacketContext;

    constructor(context: PacketContext) {
        this.context = context;
        this._client = this.newClient();
    }

    get available(): boolean {
        return this._client.available;
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        await this._client.init(pid, recv, send);
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false): Promise<Buffer> {
        console.log("REQ", pkt.cmd, pkt.data);
        const raw = await this._client.sendOidbPacket(pkt, rsp);
        console.log("RES", raw.cmd, raw.hex_data);
        return Buffer.from(raw.hex_data, "hex");
    }

    private newClient(): IPacketClient {
        const prefer = this.context.napcore.config.packetBackend;
        let client: IPacketClient | null;
        switch (prefer) {
        case "native":
            this.context.logger.info("使用指定的 NativePacketClient 作为后端");
            client = new NativePacketClient(this.context);
            break;
        case "frida":
            this.context.logger.info("[Core] [Packet] 使用指定的 FridaPacketClient 作为后端");
            client = new wsPacketClient(this.context);
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
                const client = clientFactory(this.context);
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
