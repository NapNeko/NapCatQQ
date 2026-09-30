import { TypedEventEmitter } from './typeEvent';

export interface AppEvents {
  'event:emoji_like': { groupId: string; senderUin: string; emojiId: string, msgSeq: string, isAdd: boolean, count: number; };
  KickedOffLine: string;
  // 静默离线：服务端会话已失效，但没有下发 KickedOffLine 通知
  SelfOffline: string;
}
export const appEvent = new TypedEventEmitter<AppEvents>();
