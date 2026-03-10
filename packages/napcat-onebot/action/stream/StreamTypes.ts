export type StreamPacketBasic = {
  type: StreamStatus;
  data_type?: string;
};

export type StreamPacket<T> = T & StreamPacketBasic;

export enum StreamStatus {
  Stream = 'stream',
  Response = 'response',
  Reset = 'reset',
  Error = 'error',
}
