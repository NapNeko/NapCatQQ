import { ConfigBase } from 'napcat-core/helper/config-base';
import type { NapCatCore } from 'napcat-core';
import { OneBotConfig } from './config';
import { TSchema } from '@sinclair/typebox';

export * from './config';

export class OB11ConfigLoader extends ConfigBase<OneBotConfig> {
  constructor (core: NapCatCore, configPath: string, schema: TSchema) {
    super('onebot11', core, configPath, schema);
  }
}
