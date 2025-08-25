import { ChatType, GetFileListParam, Peer, RawMessage, SendMessageElement, SendStatusType } from '@/core/types';
import { GroupFileInfoUpdateItem, InstanceContext, NapCatCore, NodeIKernelMsgService } from '@/core';
import { GeneralCallResult } from '@/core/services/common';

export class NTQQMsgApi {


    context: InstanceContext;
    core: NapCatCore;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
    }

    async clickInlineKeyboardButton(...params: Parameters<NodeIKernelMsgService['clickInlineKeyboardButton']>) {
        return this.context.session.getMsgService().clickInlineKeyboardButton(...params);
    }

    getMsgByClientSeqAndTime(peer: Peer, replyMsgClientSeq: string, replyMsgTime: string) {
        // https://bot.q.qq.com/wiki/develop/api-v2/openapi/emoji/model.html#EmojiType 可以用过特殊方式拉取
        return this.context.session.getMsgService().getMsgByClientSeqAndTime(peer, replyMsgClientSeq, replyMsgTime);
    }
    async getAioFirstViewLatestMsgs(peer: Peer, MsgCount: number) {
        return this.context.session.getMsgService().getAioFirstViewLatestMsgs(peer, MsgCount);
    }

    async sendShowInputStatusReq(peer: Peer, eventType: number) {
        return this.context.session.getMsgService().sendShowInputStatusReq(peer.chatType, eventType, peer.peerUid);
    }

    async getSourceOfReplyMsgV2(peer: Peer, clientSeq: string, time: string) {
        return this.context.session.getMsgService().getSourceOfReplyMsgV2(peer, clientSeq, time);
    }

    async getMsgEmojiLikesList(peer: Peer, msgSeq: string, emojiId: string, emojiType: string, count: number = 20) {
        //注意此处emojiType 可选值一般为1-2 2好像是unicode表情dec值 大部分情况 Taged Mlikiowa
        return this.context.session.getMsgService().getMsgEmojiLikesList(peer, msgSeq, emojiId, emojiType, '', false, count);
    }

    async setEmojiLike(peer: Peer, msgSeq: string, emojiId: string, set: boolean = true) {
        emojiId = emojiId.toString();
        return this.context.session.getMsgService().setMsgEmojiLikes(peer, msgSeq, emojiId, emojiId.length > 3 ? '2' : '1', set);
    }

    async getMultiMsg(peer: Peer, rootMsgId: string, parentMsgId: string): Promise<GeneralCallResult & {
        msgList: RawMessage[]
    } | undefined> {
        return this.context.session.getMsgService().getMultiMsg(peer, rootMsgId, parentMsgId);
    }

    async ForwardMsg(peer: Peer, msgIds: string[]) {
        return this.context.session.getMsgService().forwardMsg(msgIds, peer, [peer], new Map());
    }

    async getMsgsByMsgId(peer: Peer | undefined, msgIds: string[] | undefined) {
        if (!peer) throw new Error('peer is not allowed');
        if (!msgIds) throw new Error('msgIds is not allowed');
        //MliKiowa: 参数不合规会导致NC异常崩溃 原因是TX未对进入参数判断 对应Android标记@NotNull AndroidJADX分析可得
        return await this.context.session.getMsgService().getMsgsByMsgId(peer, msgIds);
    }

    async getSingleMsg(peer: Peer, seq: string) {
        return await this.context.session.getMsgService().getSingleMsg(peer, seq);
    }

    async fetchFavEmojiList(num: number) {
        return this.context.session.getMsgService().fetchFavEmojiList('', num, true, true);
    }

    async queryMsgsWithFilterExWithSeq(peer: Peer, msgSeq: string) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
            chatInfo: peer,
            //searchFields: 3,
            filterMsgType: [],
            filterSendersUid: [],
            filterMsgToTime: '0',
            filterMsgFromTime: '0',
            isReverseOrder: false,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }
    async queryMsgsWithFilterExWithSeqV2(peer: Peer, msgSeq: string, MsgTime: string, SendersUid: string[]) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
            chatInfo: peer,
            filterMsgType: [],
            //searchFields: 3,
            filterSendersUid: SendersUid,
            filterMsgToTime: MsgTime,
            filterMsgFromTime: MsgTime,
            isReverseOrder: false,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }
    async queryMsgsWithFilterExWithSeqV3(peer: Peer, msgSeq: string, SendersUid: string[]) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
            chatInfo: peer,
            filterMsgType: [],
            filterSendersUid: SendersUid,
            filterMsgToTime: '0',
            filterMsgFromTime: '0',
            isReverseOrder: false,
            //searchFields: 3,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }
    async queryFirstMsgBySeq(peer: Peer, msgSeq: string) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
            chatInfo: peer,
            filterMsgType: [],
            filterSendersUid: [],
            filterMsgToTime: '0',
            //searchFields: 3,
            filterMsgFromTime: '0',
            isReverseOrder: true,
            isIncludeCurrent: true,
            pageLimit: 1,
        });
    }
    // 客户端还在用别慌
    async getMsgsBySeqAndCount(peer: Peer, seq: string, count: number, desc: boolean, isReverseOrder: boolean) {
        return await this.context.session.getMsgService().getMsgsBySeqAndCount(peer, seq, count, desc, isReverseOrder);
    }
    async getMsgExBySeq(peer: Peer, msgSeq: string) {
        const DateNow = Math.floor(Date.now() / 1000);
        const filterMsgFromTime = (DateNow - 300).toString();
        const filterMsgToTime = DateNow.toString();
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', msgSeq, {
            chatInfo: peer,//此处为Peer 为关键查询参数 没有啥也没有 by mlik iowa
            filterMsgType: [],
            filterSendersUid: [],
            //searchFields: 3,
            filterMsgToTime: filterMsgToTime,
            filterMsgFromTime: filterMsgFromTime,
            isReverseOrder: false,
            isIncludeCurrent: true,
            pageLimit: 100,
        });
    }

    async queryFirstMsgBySender(peer: Peer, SendersUid: string[]) {
        return await this.context.session.getMsgService().queryMsgsWithFilterEx('0', '0', '0', {
            chatInfo: peer,
            filterMsgType: [],
            filterSendersUid: SendersUid,
            //searchFields: 3,
            filterMsgToTime: '0',
            filterMsgFromTime: '0',
            isReverseOrder: true,
            isIncludeCurrent: true,
            pageLimit: 20000,
        });
    }

    async setMsgRead(peer: Peer) {
        return this.context.session.getMsgService().setMsgRead(peer);
    }

    async getGroupFileList(GroupCode: string, params: GetFileListParam) {
        const item: GroupFileInfoUpdateItem[] = [];
        let index = params.startIndex;
        while (true) {
            params.startIndex = index;
            const [, groupFileListResult] = await this.core.eventWrapper.callNormalEventV2(
                'NodeIKernelRichMediaService/getGroupFileList',
                'NodeIKernelMsgListener/onGroupFileInfoUpdate',
                [
                    GroupCode,
                    params,
                ],
                () => true,
                () => true, // 应当通过 groupFileListResult 判断
                1,
                5000,
            );
            if (!groupFileListResult?.item?.length) break;
            item.push(...groupFileListResult.item);
            if (groupFileListResult.isEnd) break;
            if (item.length === params.fileCount) break;
            index = groupFileListResult.nextIndex;
        }
        return item;
    }

    async getMsgHistory(peer: Peer, msgId: string, count: number, isReverseOrder: boolean = false) {
        // 消息时间从旧到新
        return this.context.session.getMsgService().getMsgsIncludeSelf(peer, msgId, count, isReverseOrder);
    }

    async recallMsg(peer: Peer, msgId: string) {
        return await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelMsgService/recallMsg',
            'NodeIKernelMsgListener/onMsgInfoListUpdate',
            [peer, [msgId]],
            () => true,
            (updatedList) => updatedList.find(m => m.msgId === msgId && m.recallTime !== '0') !== undefined,
            1,
            1000,
        );
    }

    async PrepareTempChat(toUserUid: string, GroupCode: string, nickname: string) {
        return this.context.session.getMsgService().prepareTempChat({
            chatType: ChatType.KCHATTYPETEMPC2CFROMGROUP,
            peerUid: toUserUid,
            peerNickname: nickname,
            fromGroupCode: GroupCode,
            sig: '',
            selfPhone: '',
            selfUid: this.core.selfInfo.uid,
            gameSession: {
                nickname: '',
                gameAppId: '',
                selfTinyId: '',
                peerRoleId: '',
                peerOpenId: '',
            },
        });
    }

    async getTempChatInfo(chatType: ChatType, peerUid: string) {
        return this.context.session.getMsgService().getTempChatInfo(chatType, peerUid);
    }

    async sendMsg(peer: Peer, msgElements: SendMessageElement[], timeout = 10000) {
        //唉？！我有个想法
        if (peer.chatType === ChatType.KCHATTYPETEMPC2CFROMGROUP && peer.guildId && peer.guildId !== '') {
            const member = await this.core.apis.GroupApi.getGroupMember(peer.guildId, peer.peerUid);
            if (member) {
                await this.PrepareTempChat(peer.peerUid, peer.guildId, member.nick);
            }
        }
        const msgId = await this.generateMsgUniqueId(peer.chatType);
        peer.guildId = msgId;
        const [, msgList] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelMsgService/sendMsg',
            'NodeIKernelMsgListener/onMsgInfoListUpdate',
            [
                '0',
                peer,
                msgElements,
                new Map(),
            ],
            (ret) => ret.result === 0,
            msgRecords => {
                for (const msgRecord of msgRecords) {
                    if (msgRecord.guildId === msgId && msgRecord.sendStatus === SendStatusType.KSEND_STATUS_SUCCESS) {
                        return true;
                    }
                }
                return false;
            },
            1,
            timeout,
        );
        return msgList.find(msgRecord => msgRecord.guildId === msgId);
    }

    async generateMsgUniqueId(chatType: number) {
        return this.context.session.getMsgService().generateMsgUniqueId(chatType, this.context.session.getMSFService().getServerTime());
    }

    async forwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]) {
        return this.context.session.getMsgService().forwardMsg(msgIds, srcPeer, [destPeer], new Map());
    }

    async multiForwardMsg(srcPeer: Peer, destPeer: Peer, msgIds: string[]): Promise<RawMessage> {
        const msgInfos = msgIds.map(id => {
            return { msgId: id, senderShowName: this.core.selfInfo.nick };
        });
        const [, msgList] = await this.core.eventWrapper.callNormalEventV2(
            'NodeIKernelMsgService/multiForwardMsgWithComment',
            'NodeIKernelMsgListener/onMsgInfoListUpdate',
            [
                msgInfos,
                srcPeer,
                destPeer,
                [],
                new Map(),
            ],
            () => true,
            (msgRecords) => msgRecords.some(
                msgRecord => msgRecord.peerUid === destPeer.peerUid
                    && msgRecord.senderUid === this.core.selfInfo.uid
            ),
        );
        for (const msg of msgList) {
            const arkElement = msg.elements.find(ele => ele.arkElement);
            if (!arkElement) {
                continue;
            }
            const forwardData: { app: string } = JSON.parse(arkElement.arkElement?.bytesData ?? '');
            if (forwardData.app != 'com.tencent.multimsg') {
                continue;
            }
            if (msg.peerUid == destPeer.peerUid && msg.senderUid == this.core.selfInfo.uid) {
                return msg;
            }
        }
        throw new Error('转发消息超时');
    }

    async markAllMsgAsRead() {
        return this.context.session.getMsgService().setAllC2CAndGroupMsgRead();
    }
}
