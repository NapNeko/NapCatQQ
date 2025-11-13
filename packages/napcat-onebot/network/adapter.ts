import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { LogWrapper } from 'napcat-common/src/log';
import { NapCatCore } from 'napcat-core';
import { NapCatOneBot11Adapter } from '@/napcat-onebot/index';
import { ActionMap } from '@/napcat-onebot/action';
import { OB11EmitEventContent, OB11NetworkReloadType } from '@/napcat-onebot/network/index';

export abstract class IOB11NetworkAdapter<CT extends NetworkAdapterConfig> {
  name: string;
  isEnable: boolean = false;
  config: CT;
  readonly logger: LogWrapper;
  readonly core: NapCatCore;
  readonly obContext: NapCatOneBot11Adapter;
  readonly actions: ActionMap;

  constructor (name: string, config: CT, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap) {
    this.name = name;
    this.config = structuredClone(config);
    this.core = core;
    this.obContext = obContext;
    this.actions = actions;
    this.logger = core.context.logger;
  }

  abstract onEvent<T extends OB11EmitEventContent>(event: T): Promise<void>;

  abstract open (): void | Promise<void>;

  abstract close (): void | Promise<void>;

  abstract reload (config: unknown): OB11NetworkReloadType | Promise<OB11NetworkReloadType>;
}
