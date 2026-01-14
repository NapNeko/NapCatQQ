import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '@/napcat-satori/index';
import { SatoriActionMap } from '@/napcat-satori/action';
import { SatoriWebHookClientConfig } from '@/napcat-satori/config/config';
import {
  ISatoriNetworkAdapter,
  SatoriEmitEventContent,
  SatoriNetworkReloadType,
} from './adapter';

export class SatoriWebHookClientAdapter extends ISatoriNetworkAdapter<SatoriWebHookClientConfig> {
  private eventQueue: SatoriEmitEventContent[] = [];
  private isSending: boolean = false;

  constructor (
    name: string,
    config: SatoriWebHookClientConfig,
    core: NapCatCore,
    satoriContext: NapCatSatoriAdapter,
    actions: SatoriActionMap
  ) {
    super(name, config, core, satoriContext, actions);
  }

  async open (): Promise<void> {
    if (this.isEnable) return;
    this.isEnable = true;
    this.logger.log(`[Satori] WebHook客户端已启动: ${this.config.url}`);
  }

  async close (): Promise<void> {
    if (!this.isEnable) return;
    this.isEnable = false;
    this.eventQueue = [];
    this.logger.log(`[Satori] WebHook客户端已关闭`);
  }

  async reload (config: SatoriWebHookClientConfig): Promise<SatoriNetworkReloadType> {
    this.config = structuredClone(config);

    if (!config.enable) {
      return SatoriNetworkReloadType.NetWorkClose;
    }

    return SatoriNetworkReloadType.Normal;
  }

  async onEvent<T extends SatoriEmitEventContent> (event: T): Promise<void> {
    if (!this.isEnable) return;

    this.eventQueue.push(event);
    this.processQueue();
  }

  private async processQueue (): Promise<void> {
    if (this.isSending || this.eventQueue.length === 0) return;

    this.isSending = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.sendEvent(event);
      }
    }

    this.isSending = false;
  }

  private async sendEvent (event: SatoriEmitEventContent): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.token) {
        headers['Authorization'] = `Bearer ${this.config.token}`;
      }

      const response = await fetch(this.config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        this.logger.logError(`[Satori] WebHook发送失败: ${response.status} ${response.statusText}`);
      } else if (this.config.debug) {
        this.logger.logDebug(`[Satori] WebHook发送成功: ${event.type}`);
      }
    } catch (error) {
      this.logger.logError(`[Satori] WebHook发送错误: ${error}`);
    }
  }
}
