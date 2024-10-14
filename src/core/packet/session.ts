import {PacketClient} from "@/core/packet/client";
import {PacketHighwayClient} from "@/core/packet/highway/highwayClient";
import {LogWrapper} from "@/common/log";

export class PacketSession {
    readonly logger: LogWrapper;
    readonly client: PacketClient;
    private highwayClient: PacketHighwayClient

    constructor(logger: LogWrapper, client: PacketClient) {
        this.logger = logger;
        this.client = client;
        this.highwayClient = new PacketHighwayClient(this.logger, this.client);
    }
}
