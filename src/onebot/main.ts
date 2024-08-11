import {
    BuddyListener,
    BuddyReqType,
    ChatType,
    GroupListener,
    GroupNotifyTypes,
    InstanceContext,
    MsgListener,
    NapCatCore,
    RawMessage,
} from '@/core';
import { OB11Config } from './helper/config';
import { NapCatPathWrapper } from '@/common/framework/napcat';
import { OneBotApiContextType } from '@/onebot/types';
import { OneBotFriendApi, OneBotGroupApi, OneBotUserApi } from './api';
import {
    OB11ActiveHttpAdapter,
    OB11ActiveWebSocketAdapter,
    OB11NetworkManager,
    OB11PassiveHttpAdapter,
    OB11PassiveWebSocketAdapter,
} from '@/onebot/network';
import { OB11InputStatusEvent } from '@/onebot/event/notice/OB11InputStatusEvent';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { OB11Constructor } from '@/onebot/helper/data';
import { logOB11Message } from '@/onebot/helper/log';
import { proxiedListenerOf } from '@/common/utils/proxy-handler';
import { createActionMap } from './action';
import { InitWebUi } from '@/webui';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';
import { OB11FriendRecallNoticeEvent } from '@/onebot/event/notice/OB11FriendRecallNoticeEvent';
import { OB11GroupRecallNoticeEvent } from '@/onebot/event/notice/OB11GroupRecallNoticeEvent';
import { OB11FriendRequestEvent } from '@/onebot/event/request/OB11FriendRequest';
import { OB11GroupAdminNoticeEvent } from '@/onebot/event/notice/OB11GroupAdminNoticeEvent';
import { GroupDecreaseSubType, OB11GroupDecreaseEvent } from '@/onebot/event/notice/OB11GroupDecreaseEvent';
import { OB11GroupRequestEvent } from '@/onebot/event/request/OB11GroupRequest';

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    config: OB11Config;
    apiContext: OneBotApiContextType;
    networkManager: OB11NetworkManager;

    private bootTime = Date.now() / 1000;

    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.config = new OB11Config(core, pathWrapper.configPath);
        this.apiContext = {
            GroupApi: new OneBotGroupApi(this, core),
            UserApi: new OneBotUserApi(this, core),
            FriendApi: new OneBotFriendApi(this, core),
        };
        this.networkManager = new OB11NetworkManager();
        this.InitOneBot();
    }

    async InitOneBot() {
        const NTQQUserApi = this.core.apis.UserApi;
        const selfInfo = this.core.selfInfo;
        const ob11Config = this.config.configData;

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
        const actions = createActionMap(this, this.core);
        if (ob11Config.http.enable) {
            await this.networkManager.registerAdapter(new OB11PassiveHttpAdapter(
                ob11Config.http.port, ob11Config.token, this.core, this
            ));
        }
        if (ob11Config.http.enablePost) {
            ob11Config.http.postUrls.forEach(url => {
                this.networkManager.registerAdapter(new OB11ActiveHttpAdapter(
                    url, ob11Config.heartInterval, ob11Config.token, this.core, this
                ));
            });
        }
        if (ob11Config.ws.enable) {
            const OBPassiveWebSocketAdapter = new OB11PassiveWebSocketAdapter(
                ob11Config.ws.host, ob11Config.ws.port, ob11Config.heartInterval, ob11Config.token, this.core, this
            );
            await this.networkManager.registerAdapter(OBPassiveWebSocketAdapter);
        }
        if (ob11Config.reverseWs.enable) {
            ob11Config.reverseWs.urls.forEach(url => {
                this.networkManager.registerAdapter(new OB11ActiveWebSocketAdapter(
                    url, 5000, ob11Config.heartInterval, ob11Config.token, this.core, this
                ));
            });
        }

        await this.networkManager.registerAllActions(actions);
        await this.networkManager.openAllAdapters();

        this.initMsgListener();
        this.initBuddyListener();
        this.initGroupListener();

        // TODO: 兼容 Shell - MliKiowa
        await WebUiDataRuntime.setQQLoginUin(selfInfo.uin.toString());
        await WebUiDataRuntime.setQQLoginStatus(true);
        await WebUiDataRuntime.setOB11ConfigCall(async (ob11: OB11Config) => {
            this.config.save(ob11);
        });
    }

    private initMsgListener() {
        const msgListener = new MsgListener();

        msgListener.onInputStatusPush = async data => {
            const uin = await this.core.apis.UserApi.getUinByUidV2(data.fromUin);
            this.context.logger.log(`[Notice] [输入状态] ${uin} ${data.statusText}`);
            await this.networkManager.emitEvent(new OB11InputStatusEvent(
                this.core,
                parseInt(uin),
                data.eventType,
                data.statusText
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
                        guildId: ''
                    },
                    m.msgId
                );
                await this.emitMsg(m)
                    .catch(e => this.context.logger.logError('处理消息失败', e));
            }
        };

        msgListener.onMsgInfoListUpdate = async msgList => {
            this.emitRecallMsg(msgList)
                .catch(e => this.context.logger.logError('处理消息失败', e));
            for (const msg of msgList.filter(e => e.senderUin == this.core.selfInfo.uin)) {
                //  console.log(msg);
                if (msg.sendStatus == 2) {
                    // 完成后再post
                    OB11Constructor.message(this.core, msg, this.config.messagePostFormat)
                        .then((ob11Msg) => {
                            ob11Msg.target_id = parseInt(msg.peerUin);
                            if (this.config.reportSelfMessage) {
                                msg.id = MessageUnique.createMsg({ chatType: msg.chatType, peerUid: msg.peerUid, guildId: '' }, msg.msgId);
                                this.emitMsg(msg);
                            } else {
                                logOB11Message(this.core, ob11Msg);
                            }
                        });
                }
            }
        };

        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger)),
        );
    }

    private initBuddyListener() {
        const buddyListener = new BuddyListener();

        buddyListener.onBuddyReqChange = reqs => {
            reqs.buddyReqs.forEach(async req => {
                if (!!req.isInitiator || (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM)) {
                    return;
                }
                try {
                    const requesterUin = await this.core.apis.UserApi.getUinByUidV2(req.friendUid);
                    await this.networkManager.emitEvent(new OB11FriendRequestEvent(
                        this.core,
                        parseInt(requesterUin!),
                        req.friendUid + '|' + req.reqTime,
                        req.extWords
                    ));
                } catch (e) {
                    this.context.logger.logDebug('获取加好友者QQ号失败', e);
                }
            });
        };

        this.context.session.getBuddyService().addKernelBuddyListener(
            new this.context.wrapper.NodeIKernelBuddyListener(proxiedListenerOf(buddyListener, this.context.logger)),
        );
    }

    private initGroupListener() {
        const groupListener = new GroupListener();

        groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
            //console.log('ob11 onGroupNotifiesUpdated', notifies[0]);
            if (![
                GroupNotifyTypes.ADMIN_SET,
                GroupNotifyTypes.ADMIN_UNSET,
                GroupNotifyTypes.ADMIN_UNSET_OTHER
            ].includes(notifies[0]?.type)) {
                for (const notify of notifies) {
                    notify.time = Date.now();
                    const notifyTime = parseInt(notify.seq) / 1000 / 1000;
                    // log(`群通知时间${notifyTime}`, `启动时间${this.bootTime}`);
                    if (notifyTime < this.bootTime) {
                        continue;
                    }

                    const flag = notify.group.groupCode + '|' + notify.seq + '|' + notify.type;
                    this.context.logger.logDebug('收到群通知', notify);

                    // let member2: GroupMember;
                    // if (notify.user2.uid) {
                    //     member2 = await getGroupMember(notify.group.groupCode, null, notify.user2.uid);
                    // }

                    if ([
                        GroupNotifyTypes.ADMIN_SET,
                        GroupNotifyTypes.ADMIN_UNSET,
                        GroupNotifyTypes.ADMIN_UNSET_OTHER
                    ].includes(notify.type)) {
                        const member1 = await this.core.apis.GroupApi.getGroupMember(notify.group.groupCode, notify.user1.uid);
                        this.context.logger.logDebug('有管理员变动通知');
                        // refreshGroupMembers(notify.group.groupCode).then();

                        this.context.logger.logDebug('开始获取变动的管理员');
                        if (member1) {
                            this.context.logger.logDebug('变动管理员获取成功');
                            // member1.role = notify.type == GroupNotifyTypes.ADMIN_SET ? GroupMemberRole.admin : GroupMemberRole.normal;

                            const groupAdminNoticeEvent = new OB11GroupAdminNoticeEvent(
                                this.core,
                                parseInt(notify.group.groupCode),
                                parseInt(member1.uin),
                                [GroupNotifyTypes.ADMIN_UNSET, GroupNotifyTypes.ADMIN_UNSET_OTHER].includes(notify.type) ? 'unset' : 'set'
                            );
                            this.networkManager.emitEvent(groupAdminNoticeEvent)
                                .catch(e => this.context.logger.logError('处理群管理员变动失败', e));
                        } else {
                            this.context.logger.logDebug('获取群通知的成员信息失败', notify, this.core.apis.GroupApi.getGroup(notify.group.groupCode));
                        }
                    } else if (notify.type == GroupNotifyTypes.MEMBER_EXIT || notify.type == GroupNotifyTypes.KICK_MEMBER) {
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
                            subType
                        );
                        this.networkManager.emitEvent(groupDecreaseEvent)
                            .catch(e => this.context.logger.logError('处理群成员退出失败', e));
                        // notify.status == 1 表示未处理 2表示处理完成
                    } else if ([
                        GroupNotifyTypes.JOIN_REQUEST
                    ].includes(notify.type) && notify.status == 1) {
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
                                flag
                            );
                            this.networkManager.emitEvent(groupRequestEvent)
                                .catch(e => this.context.logger.logError('处理加群请求失败', e));
                        } catch (e) {
                            this.context.logger.logError('获取加群人QQ号失败 Uid:', notify.user1.uid, e);
                        }
                    } else if (notify.type == GroupNotifyTypes.INVITE_ME) {
                        this.context.logger.logDebug(`收到邀请我加群通知:${notify}`);
                        const groupInviteEvent = new OB11GroupRequestEvent(
                            this.core,
                            parseInt(notify.group.groupCode),
                            parseInt(notify.user1.uid),
                            'invite',
                            notify.postscript,
                            flag
                        );
                        this.networkManager.emitEvent(groupInviteEvent)
                            .catch(e => this.context.logger.logError('处理邀请本人加群失败', e));
                    }
                }
            }
        };

        this.context.session.getGroupService().addKernelGroupListener(
            new this.context.wrapper.NodeIKernelGroupListener(proxiedListenerOf(groupListener, this.context.logger)),
        );
    }

    private async emitMsg(message: RawMessage) {
        const { debug, reportSelfMessage } = this.config;
        this.context.logger.logDebug('收到新消息', message);
        OB11Constructor.message(this.core, message, this.config.messagePostFormat).then((ob11Msg) => {
            this.context.logger.logDebug('收到消息: ', ob11Msg);
            if (debug) {
                ob11Msg.raw = message;
            } else {
                if (ob11Msg.message.length === 0) {
                    return;
                }
            }
            logOB11Message(this.core, ob11Msg)
                .catch(e => this.context.logger.logError('logMessage error: ', e));
            const isSelfMsg = ob11Msg.user_id.toString() == this.core.selfInfo.uin;
            if (isSelfMsg && !reportSelfMessage) {
                return;
            }
            if (isSelfMsg) {
                ob11Msg.target_id = parseInt(message.peerUin);
            }
            this.networkManager.emitEvent(ob11Msg);
        }).catch(e => this.context.logger.logError('constructMessage error: ', e));

        OB11Constructor.GroupEvent(this.core, message).then(groupEvent => {
            if (groupEvent) {
                // log("post group event", groupEvent);
                this.networkManager.emitEvent(groupEvent);
            }
        }).catch(e => this.context.logger.logError('constructGroupEvent error: ', e));

        OB11Constructor.PrivateEvent(this.core, message).then(privateEvent => {
            if (privateEvent) {
                // log("post private event", privateEvent);
                this.networkManager.emitEvent(privateEvent);
            }
        }).catch(e => this.context.logger.logError('constructPrivateEvent error: ', e));
    }

    private async emitRecallMsg(msgList: RawMessage[]) {
        for (const message of msgList) {
            // log("message update", message.sendStatus, message.msgId, message.msgSeq)
            if (message.recallTime != '0') { //todo: 这个判断方法不太好，应该使用灰色消息元素来判断?
                // 撤回消息上报
                const oriMessageId = MessageUnique.getShortIdByMsgId(message.msgId);
                if (!oriMessageId) {
                    continue;
                }
                if (message.chatType == ChatType.friend) {
                    const friendRecallEvent = new OB11FriendRecallNoticeEvent(
                        this.core,
                        parseInt(message!.senderUin),
                        oriMessageId
                    );
                    this.networkManager.emitEvent(friendRecallEvent)
                        .catch(e => this.context.logger.logError('处理好友消息撤回失败', e));
                } else if (message.chatType == ChatType.group) {
                    let operatorId = message.senderUin;
                    for (const element of message.elements) {
                        const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
                        const operator = await this.core.apis.GroupApi.getGroupMember(message.peerUin, operatorUid);
                        operatorId = operator?.uin || message.senderUin;
                    }
                    const groupRecallEvent = new OB11GroupRecallNoticeEvent(
                        this.core,
                        parseInt(message.peerUin),
                        parseInt(message.senderUin),
                        parseInt(operatorId),
                        oriMessageId
                    );
                    this.networkManager.emitEvent(groupRecallEvent)
                        .catch(e => this.context.logger.logError('处理群消息撤回失败', e));
                }
            }
        }
    }
}
