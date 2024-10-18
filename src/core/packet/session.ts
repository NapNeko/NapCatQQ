import { PacketClient } from "@/core/packet/client";
import { PacketHighwaySession } from "@/core/packet/highway/session";
import { LogWrapper } from "@/common/log";

export class PacketSession {
    readonly logger: LogWrapper;
    readonly client: PacketClient;
    readonly highwaySession: PacketHighwaySession;

    constructor(logger: LogWrapper, client: PacketClient) {
        this.logger = logger;
        this.client = client;
        this.highwaySession = new PacketHighwaySession(this.logger, this.client);
    }
}
