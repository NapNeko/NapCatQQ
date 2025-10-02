import { OneBotAction, OneBotRequestToolkit } from '../OneBotAction';
import { NetworkAdapterConfig } from '@/onebot/config/config';
export type StreamPacketBasic =   {
    type: StreamStatus;
    data_type?: string;
};
export type StreamPacket<T> = T & StreamPacketBasic;
export enum StreamStatus {
    Stream = 'stream', // 分片流数据包
    Response = 'response', // 流最终响应
    Reset = 'reset', // 重置流
    Error = 'error' // 流错误
}
export abstract class BasicStream<T, R> extends OneBotAction<T, StreamPacket<R>> {
    abstract override _handle(_payload: T, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit): Promise<StreamPacket<R>>;
}
