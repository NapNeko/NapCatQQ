import { TypedEventEmitter } from "./typeEvent";

export interface AppEvents {
    'event:emoji_like': { groupId: string; senderUin: string; emojiId: string, msgSeq: string, isAdd: boolean,count:number };
}
export const appEvent = new TypedEventEmitter<AppEvents>();