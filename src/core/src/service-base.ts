import QQWrapper, { NodeIQQNTWrapperSession, NodeQQNTWrapperUtil, WrapperNodeApi } from '@/core/wrapper';
import { NTEventDispatch } from '@/common/utils/EventTask';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { logDebug } from '@/common/utils/log';
import { BuddyListener, GroupListener, MsgListener, ProfileListener } from '@/core/listeners';

export class INapCatService {
  session: NodeIQQNTWrapperSession;
  util: NodeQQNTWrapperUtil;

  constructor(
    session: NodeIQQNTWrapperSession,
    wrapper: WrapperNodeApi
  ) {
    this.session = session;
    this.util = new wrapper.NodeQQNTWrapperUtil();
    NTEventDispatch.init({
      ListenerMap: wrapper,
      WrapperSession: session,
    });
  }

  get dataPath(): string {
    let result = this.util.getNTUserDataInfoConfig();
    if (!result) {
      result = path.resolve(os.homedir(), './.config/QQ');
      fs.mkdirSync(result, { recursive: true });
    }
    return result;
  }

  protected onLoginSuccessFuncList: OnLoginSuccess[] = [];

  protected proxyHandler = {
    get(target: any, prop: any, receiver: any) {
      // console.log('get', prop, typeof target[prop]);
      if (typeof target[prop] === 'undefined') {
        // 如果方法不存在，返回一个函数，这个函数调用existentMethod
        return (...args: unknown[]) => {
          logDebug(`${target.constructor.name} has no method ${prop}`);
        };
      }
      // 如果方法存在，正常返回
      return Reflect.get(target, prop, receiver);
    }
  };

  onLoginSuccess(func: OnLoginSuccess) {
    this.onLoginSuccessFuncList.push(func);
  }

  addListener(
    listener: BuddyListener | GroupListener | MsgListener | ProfileListener
  ): number {
    // 根据listener的类型，找到对应的service，然后调用addListener方法
    // logDebug('addListener', listener.constructor.name);

    // proxy listener，调用 listener 不存在的方法时不会报错

    listener = new Proxy(listener, this.proxyHandler);
    switch (listener.constructor.name) {
    case 'BuddyListener': {
      return this.session.getBuddyService().addKernelBuddyListener(new QQWrapper.NodeIKernelBuddyListener(listener as BuddyListener));
    }
    case 'GroupListener': {
      return this.session.getGroupService().addKernelGroupListener(new QQWrapper.NodeIKernelGroupListener(listener as GroupListener));
    }
    case 'MsgListener': {
      return this.session.getMsgService().addKernelMsgListener(new QQWrapper.NodeIKernelMsgListener(listener as MsgListener));
    }
    case 'ProfileListener': {
      return this.session.getProfileService().addKernelProfileListener(new QQWrapper.NodeIKernelProfileListener(listener as ProfileListener));
    }
    default:
      return -1;
    }
  }
}

export interface OnLoginSuccess {
  (uin: string, uid: string): void | Promise<void>;
}
