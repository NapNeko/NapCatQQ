import { PacketHighwayContext } from '@/napcat-core/packet/highway/highwayContext';
import { NapCatCore } from '@/napcat-core';
import { PacketLogger } from '@/napcat-core/packet/context/loggerContext';
import { NapCoreContext } from '@/napcat-core/packet/context/napCoreContext';
import { PacketClientContext } from '@/napcat-core/packet/context/clientContext';
import { PacketOperationContext } from '@/napcat-core/packet/context/operationContext';
import { PacketMsgConverter } from '@/napcat-core/packet/message/converter';

export class PacketContext {
  readonly msgConverter: PacketMsgConverter;
  readonly napcore: NapCoreContext;
  readonly logger: PacketLogger;
  readonly client: PacketClientContext;
  readonly highway: PacketHighwayContext;
  readonly operation: PacketOperationContext;

  constructor (core: NapCatCore) {
    this.msgConverter = new PacketMsgConverter();
    this.napcore = new NapCoreContext(core);
    this.logger = new PacketLogger(this.napcore);
    this.client = new PacketClientContext(this.napcore, this.logger);
    this.highway = new PacketHighwayContext(this.napcore, this.logger, this.client);
    this.operation = new PacketOperationContext(this);
  }
}
