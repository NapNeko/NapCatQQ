import { PacketHighwayContext } from "@/core/packet/highway/highwayContext";
import { NapCatCore } from "@/core";
import { PacketLogger } from "@/core/packet/context/loggerContext";
import { NapCoreContext } from "@/core/packet/context/napCoreContext";
import { PacketClientContext } from "@/core/packet/context/clientContext";
import { PacketOperationContext } from "@/core/packet/context/operationContext";
import { PacketMsgConverter } from "@/core/packet/message/converter";

export class PacketContext {
    readonly napcore: NapCoreContext;
    readonly logger: PacketLogger;
    readonly client: PacketClientContext;
    readonly highway: PacketHighwayContext;
    readonly msgConverter: PacketMsgConverter;
    readonly operation: PacketOperationContext;

    constructor(core: NapCatCore) {
        this.napcore = new NapCoreContext(core);
        this.logger = new PacketLogger(this);
        this.client = new PacketClientContext(this);
        this.highway = new PacketHighwayContext(this);
        this.msgConverter = new PacketMsgConverter();
        this.operation = new PacketOperationContext(this);
    }
}
