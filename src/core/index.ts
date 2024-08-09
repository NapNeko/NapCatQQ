import QQWrapper from './wrapper';

import { INapCatService } from '@/core/core';

export * from './adapters';
export * from './apis';
export * from './entities';
export * from './listeners';
export * from './services';

export * as Adapters from './adapters';
export * as APIs from './apis';
export * as Entities from './entities';
export * as Listeners from './listeners';
export * as Services from './services';
export { QQWrapper as Wrapper };
export * as WrapperInterface from './wrapper';
export * as SessionConfig from './sessionConfig';

export * from './core';
export * from './service-base';

export let napCatCore: INapCatService;

export function injectService(service: INapCatService) {
  napCatCore = service;
}
