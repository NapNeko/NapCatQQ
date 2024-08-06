import QQWrapper, { NodeIQQNTWrapperSession, NodeQQNTWrapperUtil } from './wrapper';
import { BuddyListener, GroupListener, MsgListener, ProfileListener } from './listeners';

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

export interface INapCatService {
  session: NodeIQQNTWrapperSession;
  util: NodeQQNTWrapperUtil;
  dataPath: string;

  onLoginSuccess(func: OnLoginSuccess): void;

  addListener(listener: BuddyListener | GroupListener | MsgListener | ProfileListener): number
}

export interface OnLoginSuccess {
  (uin: string, uid: string): void | Promise<void>;
}

export let napCatCore: INapCatService;

export function injectService(service: INapCatService) {
  napCatCore = service;
}
