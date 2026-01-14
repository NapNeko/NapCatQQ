import { SatoriNetworkAdapterConfig } from '../config/config';
import { LogWrapper } from 'napcat-core/helper/log';
import { NapCatCore } from 'napcat-core';
import { NapCatSatoriAdapter } from '../index';
import { SatoriActionMap } from '../action';
import { SatoriEvent } from '../types';

export enum SatoriNetworkReloadType {
  Normal = 0,
  NetWorkClose = 1,
}

export type SatoriEmitEventContent = SatoriEvent;

export abstract class ISatoriNetworkAdapter<CT extends SatoriNetworkAdapterConfig> {
  name: string;
  isEnable: boolean = false;
  config: CT;
  readonly logger: LogWrapper;
  readonly core: NapCatCore;
  readonly satoriContext: NapCatSatoriAdapter;
  readonly actions: SatoriActionMap;

  constructor (
    name: string,
    config: CT,
    core: NapCatCore,
    satoriContext: NapCatSatoriAdapter,
    actions: SatoriActionMap
  ) {
    this.name = name;
    this.config = structuredClone(config);
    this.core = core;
    this.satoriContext = satoriContext;
    this.actions = actions;
    this.logger = core.context.logger;
  }

  abstract onEvent<T extends SatoriEmitEventContent> (event: T): Promise<void>;

  abstract open (): void | Promise<void>;

  abstract close (): void | Promise<void>;

  abstract reload (config: unknown): SatoriNetworkReloadType | Promise<SatoriNetworkReloadType>;

  get isActive (): boolean {
    return this.isEnable;
  }
}
