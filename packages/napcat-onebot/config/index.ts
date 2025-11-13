import { ConfigBase } from 'napcat-common/src/config-base';
import type { NapCatCore } from 'napcat-core';
import { OneBotConfig } from './config';
import { AnySchema } from 'ajv';

export class OB11ConfigLoader extends ConfigBase<OneBotConfig> {
  constructor (core: NapCatCore, configPath: string, schema: AnySchema) {
    super('onebot11', core, configPath, schema);
  }
}
