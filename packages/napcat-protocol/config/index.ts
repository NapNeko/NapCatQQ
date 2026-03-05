import { ConfigBase, NapCatCore } from 'napcat-core';

import { NapCatProtocolConfig, NapCatProtocolConfigSchema } from './config';

export class NapCatProtocolConfigLoader extends ConfigBase<NapCatProtocolConfig> {
  constructor (core: NapCatCore, configPath: string) {
    super('napcat_protocol', core, configPath, NapCatProtocolConfigSchema);
  }
}

export * from './config';
