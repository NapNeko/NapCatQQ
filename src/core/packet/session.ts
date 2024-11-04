import { PacketHighwaySession } from "@/core/packet/highway/session";
import { LogWrapper } from "@/common/log";
import { PacketPacker } from "@/core/packet/packer";
import { PacketClient } from "@/core/packet/client/client";
import { NativePacketClient } from "@/core/packet/client/nativeClient";
import { wsPacketClient } from "@/core/packet/client/wsClient";
import { NapCatCore } from "@/core";

type clientPriority = {
    [key: number]: typeof PacketClient;
}

const clientPriority: clientPriority = {
    10: NativePacketClient,
    1: wsPacketClient,
};

export class PacketSession {
    readonly logger: LogWrapper;
    readonly client: PacketClient;
    readonly packer: PacketPacker;
    readonly highwaySession: PacketHighwaySession;

    constructor(core: NapCatCore) {
        this.logger = core.context.logger;
        this.client = this.judgeClient(core);
        this.packer = new PacketPacker(this.logger, this.client);
        this.highwaySession = new PacketHighwaySession(this.logger, this.client, this.packer);
    }

    private judgeClient(core: NapCatCore): PacketClient {
        let selectedClient: typeof PacketClient | null = null;
        let maxScore = -1;
        for (const key in clientPriority) {
            const priority = parseInt(key);
            const ClientClass = clientPriority[priority];
            const score = priority * ClientClass.compatibilityScore(core.context.logger);
            if (score > maxScore) {
                maxScore = score;
                selectedClient = ClientClass;
            }
        }
        if (!selectedClient) {
            throw new Error("No compatible PacketClient found");
        }
        this.logger.log(`[Packet] 自动选择了: ${selectedClient.name}`);
        return selectedClient.create(core);
    }
}
