import { FileElement, FriendRequest, GrayTipElement, GroupNotify, RawMessage } from '@/core/entities';
import { NodeIKernelMsgListener } from '@/core/listeners';
import EventEmitter from 'node:events';
import TypedEmitter from 'typed-emitter/rxjs';
import { NapCatCore } from '@/core/index';

type NapCatInternalEvents = {
    'message/receive': (msg: RawMessage) => PromiseLike<void>;

    'message/send': (msg: RawMessage) => PromiseLike<void>;


    'buddy/request': (request: FriendRequest) => PromiseLike<void>;

    'buddy/add': (uin: string,
                  xMsg: RawMessage) => PromiseLike<void>;

    'buddy/poke': (initiatorUin: string, targetUin: string, displayMsg: string,
                   xMsg: RawMessage) => PromiseLike<void>;

    'buddy/recall': (uin: string, messageId: string,
                     xMsg: RawMessage) => PromiseLike<void>;

    'buddy/input-status': (data: Parameters<NodeIKernelMsgListener['onInputStatusPush']>[0]) => PromiseLike<void>;


    'group/request': (request: GroupNotify) => PromiseLike<void>;

    'group/admin': (groupCode: string, targetUin: string, operation: 'set' | 'unset',
                    // If it comes from onMemberInfoChange
                    xDataSource?: RawMessage, xMsg?: RawMessage,
                    // If it comes from onGroupNotifiesUpdated
                    xGroupNotify?: GroupNotify) => PromiseLike<void>;

    'group/mute': (groupCode: string, targetUin: string, duration: number, operation: 'mute' | 'unmute',
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/card-change': (groupCode: string, changedUin: string, newCard: string, oldCard: string,
                          xMsg: RawMessage) => PromiseLike<void>;

    'group/member-increase': (groupCode: string, targetUin: string, operatorUin: string, reason: 'invite' | 'approve' | 'unknown',
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease': (groupCode: string, targetUin: string, operatorUin: string, reason: 'leave' | 'kick' | 'unknown',
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/essence': (groupCode: string, messageId: string, senderUin: string, operation: 'add' | 'delete',
                      xGrayTipElement: GrayTipElement,
                      xGrayTipSourceMsg: RawMessage /* this is not the message that is set to be essence msg */) => PromiseLike<void>;

    'group/recall': (groupCode: string, operatorUin: string, messageId: string,
                     xGrayTipSourceMsg: RawMessage /* This is not the message that is recalled */) => PromiseLike<void>;

    'group/title': (groupCode: string, targetUin: string, newTitle: string,
                    xMsg: RawMessage) => PromiseLike<void>;

    'group/upload': (groupCode: string, uploaderUin: string, fileElement: FileElement,
                     xMsg: RawMessage) => PromiseLike<void>;

    'group/emoji-like': (groupCode: string, operatorUin: string, messageId: string, likes: { emojiId: string, count: number }[],
                         // If it comes from onRecvMsg
                         xGrayTipElement?: GrayTipElement, xMsg?: RawMessage,
                         // If it comes from onRecvSysMsg
                         xSysMsg?: number[]) => PromiseLike<void>;

    'group/poke': (groupCode: string, initiatorUin: string, targetUin: string, displayMsg: string,
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;
}

export class NapCatEventChannel extends
    // eslint-disable-next-line
    // @ts-ignore
    (EventEmitter as new () => TypedEmitter<NapCatInternalEvents>) {

    constructor(public core: NapCatCore) {
        super();
    }
}
