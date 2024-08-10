import { MessageElement, Peer } from '../entities';

export interface NodeIkernelTestPerformanceService {
    insertMsg(MsgParam: {
        peer: Peer
        msgTime: string
        msgId: string
        msgSeq: string
        batchNums: number
        timesPerBatch: number
        numPerTime: number
    }, msg: Array<MessageElement>): Promise<unknown>;

}
