import { PacketHighwayContext } from '@/core/packet/highway/highwayContext';
import { NapCatCore } from '@/core';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketClientContext } from '@/core/packet/context/clientContext';
import { PacketOperationContext } from '@/core/packet/context/operationContext';
import { PacketMsgConverter } from '@/core/packet/message/converter';

export class PacketContext {
    readonly msgConverter: PacketMsgConverter;
    readonly napcore: NapCoreContext;
    readonly logger: PacketLogger;
    readonly client: PacketClientContext;
    readonly highway: PacketHighwayContext;
    readonly operation: PacketOperationContext;

    constructor(core: NapCatCore) {
        this.msgConverter = new PacketMsgConverter();
        this.napcore = new NapCoreContext(core);
        this.logger = new PacketLogger(this.napcore);
        this.client = new PacketClientContext(this.napcore, this.logger);
        this.highway = new PacketHighwayContext(this.napcore, this.logger, this.client);
        this.operation = new PacketOperationContext(this);
    }
}
