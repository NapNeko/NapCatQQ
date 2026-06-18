import { LogStack } from '@/napcat-core/packet/context/clientContext';
import { NapCoreContext } from '@/napcat-core/packet/context/napCoreContext';
import { PacketLogger } from '@/napcat-core/packet/context/loggerContext';
import { OidbPacket, PacketBuf } from '@/napcat-core/packet/transformer/base';
import { Napi2NativeLoader } from '@/napcat-core/packet/handler/napi2nativeLoader';
export interface RecvPacket {
  type: string, // 仅recv
  data: RecvPacketData;
}

export interface RecvPacketData {
  seq: number;
  cmd: string;
  data: Buffer;
}

export class NativePacketClient {
  protected readonly napcore: NapCoreContext;
  protected readonly logger: PacketLogger;
  protected readonly cb = new Map<string, (json: RecvPacketData) => Promise<any> | any>(); // hash-type callback
  protected readonly napi2nativeLoader: Napi2NativeLoader;
  logStack: LogStack;
  available: boolean = false;

  constructor (napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack, napi2nativeLoader: Napi2NativeLoader) {
    this.napcore = napCore;
    this.logger = logger;
    this.logStack = logStack;
    this.napi2nativeLoader = napi2nativeLoader;
  }

  check (): boolean {
    if (!this.napi2nativeLoader.loaded) {
      this.logStack.pushLogWarn('NativePacketClient: Napi2NativeLoader 未成功加载');
      return false;
    }
    return true;
  }

  async init (_pid: number, recv: string, send: string): Promise<void> {
    const isNewQQ = this.napcore.basicInfo.requireMinNTQQBuild('40824');
    if (isNewQQ) {
      const success = this.napi2nativeLoader.initHook(send, recv);
      if (success) {
        this.available = true;
      }
    }
  }

  async sendPacket (
    cmd: string,
    data: PacketBuf,
    rsp = false,
    timeout = 5000
  ): Promise<RecvPacketData> {
    if (!rsp) {
      this.napcore
        .sendSsoCmdReqByContend(cmd, data)
        .catch((err: any) =>
          this.logger.error(
            `[PacketClient] sendPacket 无响应命令发送失败 cmd=${cmd} err=${err}`
          )
        );
      return { seq: 0, cmd, data: Buffer.alloc(0) };
    }

    const sendPromise = this.napcore
      .sendSsoCmdReqByContend(cmd, data)
      .then(ret => ({
        seq: 0,
        cmd,
        data: (ret as { rspbuffer: Buffer; }).rspbuffer,
      }));

    const timeoutPromise = new Promise<RecvPacketData>((_resolve, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `[PacketClient] sendPacket 超时 cmd=${cmd} timeout=${timeout}ms`
            )
          ),
        timeout
      );
    });

    return Promise.race([sendPromise, timeoutPromise]);
  }

  async sendOidbPacket (pkt: OidbPacket, rsp = false, timeout = 5000): Promise<RecvPacketData> {
    return await this.sendPacket(pkt.cmd, pkt.data, rsp, timeout);
  }
}
