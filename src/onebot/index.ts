import {
    BuddyReqType,
    ChatType,
    DataSource,
    GroupMemberRole,
    GroupNotifyMsgStatus,
    GroupNotifyMsgType,
    InstanceContext,
    NapCatCore,
    NodeIKernelBuddyListener,
    NodeIKernelGroupListener,
    NodeIKernelMsgListener,
    RawMessage,
    SendStatusType,
} from '@/core';
import { OB11Config, OB11ConfigLoader } from '@/onebot/config';
import {
    OB11ActiveHttpAdapter,
    OB11ActiveWebSocketAdapter,
    OB11NetworkManager,
    OB11PassiveHttpAdapter,
    OB11PassiveWebSocketAdapter,
} from '@/onebot/network';
import { NapCatPathWrapper } from '@/common/path';
import {
    OneBotFriendApi,
    OneBotGroupApi,
    OneBotMsgApi,
    OneBotQuickActionApi,
    OneBotUserApi,
    StableOneBotApiWrapper,
} from '@/onebot/api';
import { ActionMap, createActionMap } from '@/onebot/action';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';
import { OB11InputStatusEvent } from '@/onebot/event/notice/OB11InputStatusEvent';
import { MessageUnique } from '@/common/message-unique';
import { proxiedListenerOf } from '@/common/proxy-handler';
import { OB11FriendRequestEvent } from '@/onebot/event/request/OB11FriendRequest';
import { OB11GroupAdminNoticeEvent } from '@/onebot/event/notice/OB11GroupAdminNoticeEvent';
import { GroupDecreaseSubType, OB11GroupDecreaseEvent } from '@/onebot/event/notice/OB11GroupDecreaseEvent';
import { OB11GroupRequestEvent } from '@/onebot/event/request/OB11GroupRequest';
import { OB11FriendRecallNoticeEvent } from '@/onebot/event/notice/OB11FriendRecallNoticeEvent';
import { OB11GroupRecallNoticeEvent } from '@/onebot/event/notice/OB11GroupRecallNoticeEvent';
import { LRUCache } from '@/common/lru-cache';
import { NodeIKernelRecentContactListener } from '@/core/listeners/NodeIKernelRecentContactListener';
import { SysMessage } from '@/core/proto/SysMessage';
import { GreyTipWrapper } from '@/core/proto/GreyTipWrapper';
import { EmojiLikeToOthersWrapper1 } from '@/core/proto/EmojiLikeToOthers';

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    configLoader: OB11ConfigLoader;
    apis: StableOneBotApiWrapper;
    networkManager: OB11NetworkManager;
    actions: ActionMap;

    private bootTime = Date.now() / 1000;

    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.configLoader = new OB11ConfigLoader(core, pathWrapper.configPath);
        this.apis = {
            GroupApi: new OneBotGroupApi(this, core),
            UserApi: new OneBotUserApi(this, core),
            FriendApi: new OneBotFriendApi(this, core),
            MsgApi: new OneBotMsgApi(this, core),
            QuickActionApi: new OneBotQuickActionApi(this, core),
        };
        this.actions = createActionMap(this, core);
        this.networkManager = new OB11NetworkManager();
        this.InitOneBot()
            .catch(e => this.context.logger.logError('初始化OneBot失败', e));
    }

    async InitOneBot() {
        const NTQQUserApi = this.core.apis.UserApi;
        const selfInfo = this.core.selfInfo;
        const ob11Config = this.configLoader.configData;

        const serviceInfo = `
    HTTP服务 ${ob11Config.http.enable ? '已启动' : '未启动'}, ${ob11Config.http.host}:${ob11Config.http.port}
    HTTP上报服务 ${ob11Config.http.enablePost ? '已启动' : '未启动'}, 上报地址: ${ob11Config.http.postUrls}
    WebSocket服务 ${ob11Config.ws.enable ? '已启动' : '未启动'}, ${ob11Config.ws.host}:${ob11Config.ws.port}
    WebSocket反向服务 ${ob11Config.reverseWs.enable ? '已启动' : '未启动'}, 反向地址: ${ob11Config.reverseWs.urls}`;

        NTQQUserApi.getUserDetailInfo(selfInfo.uid).then(user => {
            selfInfo.nick = user.nick;
            this.context.logger.setLogSelfInfo(selfInfo);
        }).catch(this.context.logger.logError);
        this.context.logger.log(`[Notice] [OneBot11] ${serviceInfo}`);

        //创建NetWork服务
        if (ob11Config.http.enable) {
            this.networkManager.registerAdapter(new OB11PassiveHttpAdapter(
                ob11Config.http.port, ob11Config.token, this.core, this.actions,
            ));
        }
        if (ob11Config.http.enablePost) {
            ob11Config.http.postUrls.forEach(url => {
                this.networkManager.registerAdapter(new OB11ActiveHttpAdapter(
                    url, ob11Config.token, this.core, this,
                ));
            });
        }
        if (ob11Config.ws.enable) {
            const OBPassiveWebSocketAdapter = new OB11PassiveWebSocketAdapter(
                ob11Config.ws.host, ob11Config.ws.port, ob11Config.heartInterval, ob11Config.token, this.core, this.actions,
            );
            this.networkManager.registerAdapter(OBPassiveWebSocketAdapter);
        }
        if (ob11Config.reverseWs.enable) {
            ob11Config.reverseWs.urls.forEach(url => {
                this.networkManager.registerAdapter(new OB11ActiveWebSocketAdapter(
                    url, 5000, ob11Config.heartInterval, ob11Config.token, this.core, this.actions,
                ));
            });
        }

        await this.networkManager.openAllAdapters();

        this.initMsgListener();
        this.initBuddyListener();
        this.initGroupListener();
        //this.initRecentContactListener();

        await WebUiDataRuntime.setQQLoginUin(selfInfo.uin.toString());
        await WebUiDataRuntime.setQQLoginStatus(true);
        await WebUiDataRuntime.setOnOB11ConfigChanged(async (newConfig: OB11Config) => {
            const prev = this.configLoader.configData;
            this.configLoader.save(newConfig);
            this.context.logger.log(`OneBot11 配置更改：${JSON.stringify(prev)} -> ${JSON.stringify(newConfig)}`);
            await this.reloadNetwork(prev, newConfig);
        });
    }

    initRecentContactListener() {
        const recentContactListener = new NodeIKernelRecentContactListener();
        recentContactListener.onRecentContactNotification = function(msgList: any[] /* arg0: { msgListUnreadCnt: string }, arg1: number */) {
            msgList.forEach((msg) => {
                if (msg.chatType == ChatType.KCHATTYPEGROUP) {
                    // log("recent contact", msgList, arg0, arg1);
                }
            });
        };
    }

    private async reloadNetwork(prev: OB11Config, now: OB11Config) {
        const serviceInfo = `
    HTTP服务 ${now.http.enable ? '已启动' : '未启动'}, ${now.http.host}:${now.http.port}
    HTTP上报服务 ${now.http.enablePost ? '已启动' : '未启动'}, 上报地址: ${now.http.postUrls}
    WebSocket服务 ${now.ws.enable ? '已启动' : '未启动'}, ${now.ws.host}:${now.ws.port}
    WebSocket反向服务 ${now.reverseWs.enable ? '已启动' : '未启动'}, 反向地址: ${now.reverseWs.urls}`;
        this.context.logger.log(`[Notice] [OneBot11] 热重载 ${serviceInfo}`);

        // check difference in passive http (Http)
        if (prev.http.enable !== now.http.enable) {
            if (now.http.enable) {
                await this.networkManager.registerAdapterAndOpen(new OB11PassiveHttpAdapter(
                    now.http.port, now.token, this.core, this.actions,
                ));
            } else {
                await this.networkManager.closeAdapterByPredicate(adapter => adapter instanceof OB11PassiveHttpAdapter);
            }
        }

        // check difference in active http (HttpPost)
        if (prev.http.enablePost !== now.http.enablePost) {
            if (now.http.enablePost) {
                now.http.postUrls.forEach(url => {
                    this.networkManager.registerAdapterAndOpen(new OB11ActiveHttpAdapter(
                        url, now.token, this.core, this,
                    ));
                });
            } else {
                await this.networkManager.closeAdapterByPredicate(adapter => adapter instanceof OB11ActiveHttpAdapter);
            }
        } else {
            if (now.http.enablePost) {
                const { added, removed } = this.findDifference<string>(prev.http.postUrls, now.http.postUrls);
                await this.networkManager.closeAdapterByPredicate(
                    adapter => adapter instanceof OB11ActiveHttpAdapter && removed.includes(adapter.url),
                );
                for (const url of added) {
                    await this.networkManager.registerAdapterAndOpen(new OB11ActiveHttpAdapter(
                        url, now.token, this.core, this,
                    ));
                }
            }
        }

        // check difference in passive websocket (Ws)
        if (prev.ws.enable !== now.ws.enable) {
            if (now.ws.enable) {
                await this.networkManager.registerAdapterAndOpen(new OB11PassiveWebSocketAdapter(
                    now.ws.host, now.ws.port, now.heartInterval, now.token, this.core, this.actions,
                ));
            } else {
                await this.networkManager.closeAdapterByPredicate(
                    adapter => adapter instanceof OB11PassiveWebSocketAdapter,
                );
            }
        }

        // check difference in active websocket (ReverseWs)
        if (prev.reverseWs.enable !== now.reverseWs.enable) {
            if (now.reverseWs.enable) {
                now.reverseWs.urls.forEach(url => {
                    this.networkManager.registerAdapterAndOpen(new OB11ActiveWebSocketAdapter(
                        url, 5000, now.heartInterval, now.token, this.core, this.actions,
                    ));
                });
            } else {
                await this.networkManager.closeAdapterByPredicate(
                    adapter => adapter instanceof OB11ActiveWebSocketAdapter,
                );
            }
        } else {
            if (now.reverseWs.enable) {
                const { added, removed } = this.findDifference<string>(prev.reverseWs.urls, now.reverseWs.urls);
                await this.networkManager.closeAdapterByPredicate(
                    adapter => adapter instanceof OB11ActiveWebSocketAdapter && removed.includes(adapter.url),
                );
                for (const url of added) {
                    await this.networkManager.registerAdapterAndOpen(new OB11ActiveWebSocketAdapter(
                        url, 5000, now.heartInterval, now.token, this.core, this.actions,
                    ));
                }
            }
        }
    }

    private findDifference<T>(prev: T[], now: T[]): { added: T[], removed: T[] } {
        const added = now.filter(item => !prev.includes(item));
        const removed = prev.filter(item => !now.includes(item));
        return { added, removed };
    }

    private initMsgListener() {
        const msgListener = new NodeIKernelMsgListener();

        msgListener.onRecvSysMsg = async msg => {
            const sysMsg = SysMessage.fromBinary(Uint8Array.from(msg));
            if (sysMsg.msgSpec.length === 0) {
                return;
            }
            const { msgType, subType, subSubType } = sysMsg.msgSpec[0];
            if (msgType === 732 && subType === 16 && subSubType === 16 ) {
                const greyTip = GreyTipWrapper.fromBinary(Uint8Array.from(sysMsg.bodyWrapper!.wrappedBody.slice(7)));
                if (greyTip.subTypeId === 36) {
                    const emojiLikeToOthers = EmojiLikeToOthersWrapper1
                        .fromBinary(greyTip.rest)
                        .wrapper!
                        .body!;
                    const eventOrEmpty = await this.apis.GroupApi.createGroupEmojiLikeEvent(
                        greyTip.groupCode.toString(),
                        await this.core.apis.UserApi.getUinByUidV2(emojiLikeToOthers.attributes!.senderUid),
                        emojiLikeToOthers.msgSpec!.msgSeq.toString(),
                        emojiLikeToOthers.attributes!.emojiId,
                    );
                    eventOrEmpty && await this.networkManager.emitEvent(eventOrEmpty);
                }
            }
        };

        msgListener.onInputStatusPush = async data => {
            const uin = await this.core.apis.UserApi.getUinByUidV2(data.fromUin);
            this.context.logger.log(`[Notice] [输入状态] ${uin} ${data.statusText}`);
            await this.networkManager.emitEvent(new OB11InputStatusEvent(
                this.core,
                parseInt(uin),
                data.eventType,
                data.statusText,
            ));
        };

        msgListener.onRecvMsg = async msg => {
            for (const m of msg) {
                if (this.bootTime > parseInt(m.msgTime)) {
                    this.context.logger.logDebug(`消息时间${m.msgTime}早于启动时间${this.bootTime}，忽略上报`);
                    continue;
                }
                m.id = MessageUnique.createMsg(
                    {
                        chatType: m.chatType,
                        peerUid: m.peerUid,
                        guildId: '',
                    },
                    m.msgId,
                );
                await this.emitMsg(m)
                    .catch(e => this.context.logger.logError('处理消息失败', e));
            }
        };

        const msgIdSend = new LRUCache<string, boolean>(100);
        const recallMsgs = new LRUCache<string, boolean>(100);
        msgListener.onMsgInfoListUpdate = async msgList => {
            this.emitRecallMsg(msgList, recallMsgs)
                .catch(e => this.context.logger.logError('处理消息失败', e));

            for (const msg of msgList.filter(e => e.senderUin == this.core.selfInfo.uin)) {
                if (msg.sendStatus == SendStatusType.KSEND_STATUS_SUCCESS && !msgIdSend.get(msg.msgId)) {
                    msgIdSend.put(msg.msgId, true);
                    // 完成后再post
                    this.apis.MsgApi.parseMessage(msg)
                        .then((ob11Msg) => {
                            if (!ob11Msg) return;
                            ob11Msg.target_id = parseInt(msg.peerUin);
                            if (this.configLoader.configData.reportSelfMessage) {
                                msg.id = MessageUnique.createMsg({
                                    chatType: msg.chatType,
                                    peerUid: msg.peerUid,
                                    guildId: '',
                                }, msg.msgId);
                                this.emitMsg(msg);
                            } else {
                                // logOB11Message(this.core, ob11Msg);
                            }
                        });
                }
            }
        };

        this.context.session.getMsgService().addKernelMsgListener(
            proxiedListenerOf(msgListener, this.context.logger) as any,
        );
    }

    private initBuddyListener() {
        const buddyListener = new NodeIKernelBuddyListener();

        buddyListener.onBuddyReqChange = async reqs => {
            this.core.apis.FriendApi.clearBuddyReqUnreadCnt();
            for (let i = 0; i < reqs.unreadNums; i++) {
                const req = reqs.buddyReqs[i];
                //req.isBuddy === false是单向好友 null为常规情况
                // if (req.isBuddy === false && ) {
                //     const NTQQFriendApi = this.core.apis.FriendApi;
                //     await NTQQFriendApi.handleFriendRequest(req.friendUid + '|' + req.reqTime, true);
                // }

                if (!!req.isInitiator || (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM)) {
                    return;
                }
                try {
                    const requesterUin = await this.core.apis.UserApi.getUinByUidV2(req.friendUid);
                    await this.networkManager.emitEvent(new OB11FriendRequestEvent(
                        this.core,
                        parseInt(requesterUin!),
                        req.extWords,
                        req.friendUid + '|' + req.reqTime,
                    ));
                } catch (e) {
                    this.context.logger.logDebug('获取加好友者QQ号失败', e);
                }
            }
        };

        this.context.session.getBuddyService().addKernelBuddyListener(
            proxiedListenerOf(buddyListener, this.context.logger) as any,
        );
    }

    private initGroupListener() {
        const groupListener = new NodeIKernelGroupListener();

        groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
            //console.log('ob11 onGroupNotifiesUpdated', notifies[0]);
            if (![
                GroupNotifyMsgType.SET_ADMIN,
                GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
                GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
            ].includes(notifies[0]?.type)) {
                for (const notify of notifies) {
                    const notifyTime = parseInt(notify.seq) / 1000 / 1000;
                    // log(`群通知时间${notifyTime}`, `启动时间${this.bootTime}`);
                    if (notifyTime < this.bootTime) {
                        continue;
                    }

                    const flag = notify.group.groupCode + '|' + notify.seq + '|' + notify.type;
                    this.context.logger.logDebug('收到群通知', notify);

                    if ([
                        GroupNotifyMsgType.SET_ADMIN,
                        GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
                        GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
                    ].includes(notify.type)) {
                        const member1 = await this.core.apis.GroupApi.getGroupMember(notify.group.groupCode, notify.user1.uid);
                        this.context.logger.logDebug('有管理员变动通知');
                        // refreshGroupMembers(notify.group.groupCode).then();

                        this.context.logger.logDebug('开始获取变动的管理员');
                        if (member1) {
                            this.context.logger.logDebug('变动管理员获取成功');
                            const groupAdminNoticeEvent = new OB11GroupAdminNoticeEvent(
                                this.core,
                                parseInt(notify.group.groupCode),
                                parseInt(member1.uin),
                                [
                                    GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
                                    GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
                                ].includes(notify.type) ? 'unset' : 'set',
                            );
                            this.networkManager.emitEvent(groupAdminNoticeEvent)
                                .catch(e => this.context.logger.logError('处理群管理员变动失败', e));
                        } else {
                            this.context.logger.logDebug('获取群通知的成员信息失败', notify, this.core.apis.GroupApi.getGroup(notify.group.groupCode));
                        }
                    } else if (notify.type == GroupNotifyMsgType.MEMBER_LEAVE_NOTIFY_ADMIN || notify.type == GroupNotifyMsgType.KICK_MEMBER_NOTIFY_ADMIN) {
                        this.context.logger.logDebug('有成员退出通知', notify);
                        const member1Uin = (await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid))!;
                        let operatorId = member1Uin;
                        let subType: GroupDecreaseSubType = 'leave';
                        if (notify.user2.uid) {
                            // 是被踢的
                            const member2Uin = await this.core.apis.UserApi.getUinByUidV2(notify.user2.uid);
                            if (member2Uin) {
                                operatorId = member2Uin;
                            }
                            subType = 'kick';
                        }
                        const groupDecreaseEvent = new OB11GroupDecreaseEvent(
                            this.core,
                            parseInt(notify.group.groupCode),
                            parseInt(member1Uin),
                            parseInt(operatorId),
                            subType,
                        );
                        this.networkManager.emitEvent(groupDecreaseEvent)
                            .catch(e => this.context.logger.logError('处理群成员退出失败', e));
                        // notify.status == 1 表示未处理 2表示处理完成
                    } else if ([
                        GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS,
                    ].includes(notify.type) && notify.status == GroupNotifyMsgStatus.KUNHANDLE) {
                        this.context.logger.logDebug('有加群请求');
                        try {
                            let requestUin = (await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid))!;
                            if (isNaN(parseInt(requestUin))) {
                                requestUin = (await this.core.apis.UserApi.getUserDetailInfo(notify.user1.uid)).uin;
                            }
                            const groupRequestEvent = new OB11GroupRequestEvent(
                                this.core,
                                parseInt(notify.group.groupCode),
                                parseInt(requestUin),
                                'add',
                                notify.postscript,
                                flag,
                            );
                            this.networkManager.emitEvent(groupRequestEvent)
                                .catch(e => this.context.logger.logError('处理加群请求失败', e));
                        } catch (e) {
                            this.context.logger.logError('获取加群人QQ号失败 Uid:', notify.user1.uid, e);
                        }
                    } else if (notify.type == GroupNotifyMsgType.INVITED_BY_MEMBER && notify.status == GroupNotifyMsgStatus.KUNHANDLE) {
                        this.context.logger.logDebug(`收到邀请我加群通知:${notify}`);
                        const groupInviteEvent = new OB11GroupRequestEvent(
                            this.core,
                            parseInt(notify.group.groupCode),
                            parseInt(await this.core.apis.UserApi.getUinByUidV2(notify.user2.uid)),
                            'invite',
                            notify.postscript,
                            flag,
                        );
                        this.networkManager.emitEvent(groupInviteEvent)
                            .catch(e => this.context.logger.logError('处理邀请本人加群失败', e));
                    }
                }
            }
        };

        groupListener.onMemberInfoChange = async (groupCode, dataSource, members) => {
            //this.context.logger.logDebug('收到群成员信息变动通知', groupCode, changeType);
            if (dataSource === DataSource.LOCAL) {
                const existMembers = this.core.apis.GroupApi.groupMemberCache.get(groupCode);
                if (!existMembers) return;
                members.forEach((member) => {
                    const existMember = existMembers.get(member.uid);
                    if (!existMember?.isChangeRole) return;
                    this.context.logger.logDebug('变动管理员获取成功');
                    const groupAdminNoticeEvent = new OB11GroupAdminNoticeEvent(
                        this.core,
                        parseInt(groupCode),
                        parseInt(member.uin),
                        member.role === GroupMemberRole.admin ? 'set' : 'unset',
                    );
                    this.networkManager.emitEvent(groupAdminNoticeEvent)
                        .catch(e => this.context.logger.logError('处理群管理员变动失败', e));
                    existMember.isChangeRole = false;
                    this.context.logger.logDebug('群管理员变动处理完毕');
                });
            }
        };

        this.context.session.getGroupService().addKernelGroupListener(
            proxiedListenerOf(groupListener, this.context.logger),
        );
    }

    private async emitMsg(message: RawMessage) {
        const { debug, reportSelfMessage, messagePostFormat } = this.configLoader.configData;
        this.context.logger.logDebug('收到新消息 RawMessage', message);
        this.apis.MsgApi.parseMessage(message, messagePostFormat).then((ob11Msg) => {
            if (!ob11Msg) return;
            this.context.logger.logDebug('转化为 OB11Message', ob11Msg);
            if (debug) {
                ob11Msg.raw = message;
            } else {
                if (ob11Msg.message.length === 0) {
                    return;
                }
            }
            // logOB11Message(this.core, ob11Msg)
            //    .catch(e => this.context.logger.logError('logMessage error: ', e));
            const isSelfMsg = ob11Msg.user_id.toString() == this.core.selfInfo.uin;
            if (isSelfMsg && !reportSelfMessage) {
                return;
            }
            if (isSelfMsg) {
                ob11Msg.target_id = parseInt(message.peerUin);
            }
            this.networkManager.emitEvent(ob11Msg);
        }).catch(e => this.context.logger.logError('constructMessage error: ', e));

        this.apis.GroupApi.parseGroupEvent(message).then(groupEvent => {
            if (groupEvent) {
                // log("post group event", groupEvent);
                this.networkManager.emitEvent(groupEvent);
            }
        }).catch(e => this.context.logger.logError('constructGroupEvent error: ', e));

        this.apis.MsgApi.parsePrivateMsgEvent(message).then(privateEvent => {
            if (privateEvent) {
                // log("post private event", privateEvent);
                this.networkManager.emitEvent(privateEvent);
            }
        }).catch(e => this.context.logger.logError('constructPrivateEvent error: ', e));
    }

    private async emitRecallMsg(msgList: RawMessage[], cache: LRUCache<string, boolean>) {
        for (const message of msgList) {
            // log("message update", message.sendStatus, message.msgId, message.msgSeq)
            if (message.recallTime != '0' && !cache.get(message.msgId)) { //todo: 这个判断方法不太好，应该使用灰色消息元素来判断?
                cache.put(message.msgId, true);
                // 撤回消息上报
                const oriMessageId = MessageUnique.getShortIdByMsgId(message.msgId);
                if (!oriMessageId) {
                    continue;
                }
                if (message.chatType == ChatType.KCHATTYPEC2C) {
                    const friendRecallEvent = new OB11FriendRecallNoticeEvent(
                        this.core,
                        parseInt(message!.senderUin),
                        oriMessageId,
                    );
                    this.networkManager.emitEvent(friendRecallEvent)
                        .catch(e => this.context.logger.logError('处理好友消息撤回失败', e));
                } else if (message.chatType == ChatType.KCHATTYPEGROUP) {
                    let operatorId = message.senderUin;
                    for (const element of message.elements) {
                        const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
                        if (!operatorUid) return;
                        const operator = await this.core.apis.GroupApi.getGroupMember(message.peerUin, operatorUid);
                        operatorId = operator?.uin || message.senderUin;
                    }
                    const groupRecallEvent = new OB11GroupRecallNoticeEvent(
                        this.core,
                        parseInt(message.peerUin),
                        parseInt(message.senderUin),
                        parseInt(operatorId),
                        oriMessageId,
                    );
                    this.networkManager.emitEvent(groupRecallEvent)
                        .catch(e => this.context.logger.logError('处理群消息撤回失败', e));
                }
            }
        }
    }
}

export * from './types';
