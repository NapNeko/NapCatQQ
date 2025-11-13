import { MsfChangeReasonType, MsfStatusType } from '@/napcat-core/types/adapter';

export class NodeIDependsAdapter {
  onMSFStatusChange (_statusType: MsfStatusType, _changeReasonType: MsfChangeReasonType) {

  }

  onMSFSsoError (_args: unknown) {

  }

  getGroupCode (_args: unknown) {

  }

  // onSendMsfReply (_seq: string, _cmd: string, _uk1: number, _uk2: string, _rsp: {
  //   ssoRetCode: 0,
  //   trpcRetCode: 0,
  //   trpcFuncCode: 0,
  //   errorMsg: '',
  //   pbBuffer: Uint8Array,
  //   transInfoMap: Map<unknown, unknown>;
  // }) {

  //   console.log('[NodeIDependsAdapter] onSendMsfReply', _seq, _cmd, _uk1, _uk2, Buffer.from(_rsp.pbBuffer).toString('hex'));
  // }
}