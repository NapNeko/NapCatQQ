import { NetworkAdapterConfig } from '@/napcat-protocol/config/config';
import { LogWrapper } from 'napcat-core/helper/log';
import { NapCatCore } from 'napcat-core';
import { NapCatProtocolAdapter } from '@/napcat-protocol/index';
import { ActionMap } from '@/napcat-protocol/action';
import { NapCatProtocolEmitEventContent, NapCatProtocolNetworkReloadType } from '@/napcat-protocol/network/index';

export abstract class INapCatProtocolNetworkAdapter<CT extends NetworkAdapterConfig> {
  name: string;
  isEnable: boolean = false;
  config: CT;
  readonly logger: LogWrapper;
  readonly core: NapCatCore;
  readonly protocolContext: NapCatProtocolAdapter;
  readonly actions: ActionMap;

  constructor (name: string, config: CT, core: NapCatCore, protocolContext: NapCatProtocolAdapter, actions: ActionMap) {
    this.name = name;
    this.config = structuredClone(config);
    this.core = core;
    this.protocolContext = protocolContext;
    this.actions = actions;
    this.logger = core.context.logger;
  }

  abstract onEvent<T extends NapCatProtocolEmitEventContent> (event: T): Promise<void>;

  abstract open (): void | Promise<void>;

  abstract close (): void | Promise<void>;

  abstract reload (config: unknown): NapCatProtocolNetworkReloadType | Promise<NapCatProtocolNetworkReloadType>;

  get isActive (): boolean {
    return this.isEnable;
  }
}
