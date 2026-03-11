import { OneBotAction, OneBotRequestToolkit } from '../OneBotAction';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket } from './StreamTypes';

export type { StreamPacketBasic, StreamPacket } from './StreamTypes';
export { StreamStatus } from './StreamTypes';

export abstract class BasicStream<T, R> extends OneBotAction<T, StreamPacket<R>> {
  abstract override _handle (_payload: T, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<R>>;
}
