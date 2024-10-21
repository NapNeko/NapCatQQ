import { PacketClient } from "@/core/packet/client";
import { PacketHighwaySession } from "@/core/packet/highway/session";
import { LogWrapper } from "@/common/log";
import { PacketPacker } from "@/core/packet/packer";

export class PacketSession {
    readonly logger: LogWrapper;
    readonly client: PacketClient;
    readonly packer: PacketPacker;
    readonly highwaySession: PacketHighwaySession;

    constructor(logger: LogWrapper, client: PacketClient) {
        this.logger = logger;
        this.client = client;
        this.packer = new PacketPacker(this.logger, this.client);
        this.highwaySession = new PacketHighwaySession(this.logger, this.client, this.packer);
    }
}
