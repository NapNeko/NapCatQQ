import { NativePacketClient } from '@/napcat-core/packet/client/nativeClient';
import { OidbPacket } from '@/napcat-core/packet/transformer/base';
import { PacketLogger } from '@/napcat-core/packet/context/loggerContext';
import { NapCoreContext } from '@/napcat-core/packet/context/napCoreContext';

export class LogStack {
  private stack: string[] = [];
  private readonly logger: PacketLogger;

  constructor (logger: PacketLogger) {
    this.logger = logger;
  }

  push (msg: string) {
    this.stack.push(msg);
  }

  pushLogInfo (msg: string) {
    this.logger.info(msg);
    this.stack.push(`${new Date().toISOString()} [INFO] ${msg}`);
  }

  pushLogWarn (msg: string) {
    this.logger.warn(msg);
    this.stack.push(`${new Date().toISOString()} [WARN] ${msg}`);
  }

  pushLogError (msg: string) {
    this.logger.error(msg);
    this.stack.push(`${new Date().toISOString()} [ERROR] ${msg}`);
  }

  clear () {
    this.stack = [];
  }

  content () {
    return this.stack.join('\n');
  }
}

export class PacketClientContext {
  private readonly napCore: NapCoreContext;
  private readonly logger: PacketLogger;
  private readonly logStack: LogStack;
  private readonly _client: NativePacketClient;

  constructor (napCore: NapCoreContext, logger: PacketLogger) {
    this.napCore = napCore;
    this.logger = logger;
    this.logStack = new LogStack(logger);
    this._client = this.newClient();
  }

  get available (): boolean {
    return this._client.available;
  }

  get clientLogStack (): string {
    return this._client.logStack.content();
  }

  async init (pid: number, recv: string, send: string): Promise<void> {
    await this._client.init(pid, recv, send);
  }

  async sendOidbPacket<T extends boolean = false>(pkt: OidbPacket, rsp?: T, timeout?: number): Promise<T extends true ? Buffer : void> {
    const raw = await this._client.sendOidbPacket(pkt, rsp, timeout);
    return raw.data as T extends true ? Buffer : void;
  }

  private newClient (): NativePacketClient {
    this.logger.info('使用 NativePacketClient 作为后端');
    const client = new NativePacketClient(this.napCore, this.logger, this.logStack);
    if (!client.check()) {
      throw new Error('[Core] [Packet] NativePacketClient 不可用，NapCat.Packet将不会加载！');
    }
    return client;
  }
}
