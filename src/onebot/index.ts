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
    Peer,
    RawMessage,
    SendStatusType,
} from '@/core';
import { OB11ConfigLoader } from '@/onebot/config';
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
import { BotOfflineEvent } from './event/notice/BotOfflineEvent';
import { mergeOneBotConfigs, migrateOneBotConfigsV1, OneBotConfig } from './config/config';
import { OB11Message } from './types';

//OneBot实现类
export class NapCatOneBot11Adapter {
    readonly core: NapCatCore;
    readonly context: InstanceContext;

    configLoader: OB11ConfigLoader;
    apis: StableOneBotApiWrapper;
    networkManager: OB11NetworkManager;
    actions: ActionMap;
    private readonly bootTime = Date.now() / 1000;
    recallMsgCache = new LRUCache<string, RawMessage>(100);

    constructor(core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
        this.core = core;
        this.context = context;
        this.configLoader = new OB11ConfigLoader(core, pathWrapper.configPath);
        this.configLoader.save(migrateOneBotConfigsV1(this.configLoader.configData));
        this.configLoader.save(mergeOneBotConfigs(this.configLoader.configData));
        this.apis = {
            GroupApi: new OneBotGroupApi(this, core),
            UserApi: new OneBotUserApi(this, core),
            FriendApi: new OneBotFriendApi(this, core),
            MsgApi: new OneBotMsgApi(this, core),
            QuickActionApi: new OneBotQuickActionApi(this, core),
        };
        this.actions = createActionMap(this, core);
        this.networkManager = new OB11NetworkManager();
    }
    async creatOneBotLog(ob11Config: OneBotConfig) {
        let log = `[network] 配置加载\n`;
        for (const key of ob11Config.network.httpServers) {
            log += `HTTP服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
        }
        for (const key of ob11Config.network.httpClients) {
            log += `HTTP上报服务: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
        }
        for (const key of ob11Config.network.websocketServers) {
            log += `WebSocket服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
        }
        for (const key of ob11Config.network.websocketClients) {
            log += `WebSocket反向服务: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
        }
        return log;
    }
    async InitOneBot() {
        const selfInfo = this.core.selfInfo;
        const ob11Config = this.configLoader.configData;

        this.core.apis.UserApi.getUserDetailInfo(selfInfo.uid)
            .then((user) => {
                selfInfo.nick = user.nick;
                this.context.logger.setLogSelfInfo(selfInfo);
            })
            .catch(this.context.logger.logError.bind(this.context.logger));

        const serviceInfo = await this.creatOneBotLog(ob11Config);
        this.context.logger.log(`[Notice] [OneBot11] ${serviceInfo}`);

        // //创建NetWork服务
        for (const key of ob11Config.network.httpServers) {
            if (key.enable) {
                this.networkManager.registerAdapter(
                    new OB11PassiveHttpAdapter(key.name, key, this.core, this.actions)
                );
            }
        }
        for (const key of ob11Config.network.httpClients) {
            if (key.enable) {
                this.networkManager.registerAdapter(
                    new OB11ActiveHttpAdapter(key.name, key, this.core, this, this.actions)
                );
            }
        }
        for (const key of ob11Config.network.websocketServers) {
            if (key.enable) {
                this.networkManager.registerAdapter(
                    new OB11PassiveWebSocketAdapter(
                        key.name,
                        key,
                        this.core,
                        this.actions
                    )
                );
            }
        }
        for (const key of ob11Config.network.websocketClients) {
            if (key.enable) {
                this.networkManager.registerAdapter(
                    new OB11ActiveWebSocketAdapter(
                        key.name,
                        key,
                        this.core,
                        this.actions
                    )
                );
            }
        }
        await this.networkManager.openAllAdapters();

        this.initMsgListener();
        this.initBuddyListener();
        this.initGroupListener();

        await WebUiDataRuntime.setQQLoginUin(selfInfo.uin.toString());
        await WebUiDataRuntime.setQQLoginStatus(true);
        await WebUiDataRuntime.setOnOB11ConfigChanged(async (newConfig) => {
            const prev = this.configLoader.configData;
            this.configLoader.save(newConfig);
            this.context.logger.log(`OneBot11 配置更改：${JSON.stringify(prev)} -> ${JSON.stringify(newConfig)}`);
            await this.reloadNetwork(prev, newConfig);
        });
    }

    initRecentContactListener() {
        const recentContactListener = new NodeIKernelRecentContactListener();
        recentContactListener.onRecentContactNotification = function (
            msgList: any[] /* arg0: { msgListUnreadCnt: string }, arg1: number */
        ) {
            msgList.forEach((msg) => {
                if (msg.chatType == ChatType.KCHATTYPEGROUP) {
                    // log("recent contact", msgList, arg0, arg1);
                }
            });
        };
    }

    private async reloadNetwork(prev: OneBotConfig, now: OneBotConfig) {
        const prevLog = await this.creatOneBotLog(prev);
        const newLog = await this.creatOneBotLog(now);
        this.context.logger.log(`[Notice] [OneBot11] 配置变更前:\n${prevLog}`);
        this.context.logger.log(`[Notice] [OneBot11] 配置变更后:\n${newLog}`);
        const { added: addedHttpServers, removed: removedHttpServers } = this.findDifference(prev.network.httpServers, now.network.httpServers);
        const { added: addedHttpClients, removed: removedHttpClients } = this.findDifference(prev.network.httpClients, now.network.httpClients);
        const { added: addedWebSocketServers, removed: removedWebSocketServers } = this.findDifference(prev.network.websocketServers, now.network.websocketServers);
        const { added: addedWebSocketClients, removed: removedWebSocketClients } = this.findDifference(prev.network.websocketClients, now.network.websocketClients);

        // 移除旧的 HTTP 服务器
        for (const server of removedHttpServers) {
            await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === server.name);
        }

        // 移除旧的 HTTP 客户端
        for (const client of removedHttpClients) {
            await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === client.name);
        }

        // 移除旧的 WebSocket 服务器
        for (const server of removedWebSocketServers) {
            await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === server.name);
        }

        // 移除旧的 WebSocket 客户端
        for (const client of removedWebSocketClients) {
            await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === client.name);
        }

        // 处理 enable 状态变化的 HTTP 服务器
        for (const server of now.network.httpServers) {
            const prevServer = prev.network.httpServers.find(s => s.name === server.name);
            if (prevServer && prevServer.enable !== server.enable) {
                if (server.enable) {
                    let adapter = new OB11PassiveHttpAdapter(server.name, server, this.core, this.actions);
                    adapter.open();
                    this.networkManager.registerAdapter(
                        adapter
                    );
                } else {
                    await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === server.name);
                }
            }
        }

        // 处理 enable 状态变化的 HTTP 客户端
        for (const client of now.network.httpClients) {
            const prevClient = prev.network.httpClients.find(c => c.name === client.name);
            if (prevClient && prevClient.enable !== client.enable) {
                if (client.enable) {
                    let adapter = new OB11ActiveHttpAdapter(client.name, client, this.core, this, this.actions);
                    adapter.open();
                    this.networkManager.registerAdapter(
                        adapter
                    );
                } else {
                    await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === client.name);
                }
            }
        }

        // 处理 enable 状态变化的 WebSocket 服务器
        for (const server of now.network.websocketServers) {
            const prevServer = prev.network.websocketServers.find(s => s.name === server.name);
            if (prevServer && prevServer.enable !== server.enable) {
                if (server.enable) {
                    let adapter = new OB11PassiveWebSocketAdapter(
                        server.name,
                        server,
                        this.core,
                        this.actions
                    );
                    adapter.open();
                    this.networkManager.registerAdapter(
                        adapter
                    );
                } else {
                    await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === server.name);
                }
            }
        }

        // 处理 enable 状态变化的 WebSocket 客户端
        for (const client of now.network.websocketClients) {
            const prevClient = prev.network.websocketClients.find(c => c.name === client.name);
            if (prevClient && prevClient.enable !== client.enable) {
                if (client.enable) {
                    let adapter = new OB11ActiveWebSocketAdapter(
                        client.name,
                        client,
                        this.core,
                        this.actions
                    )
                    this.networkManager.registerAdapter(
                        adapter
                    );
                } else {
                    await this.networkManager.closeAdapterByPredicate((adapter) => adapter.name === client.name);
                }
            }
        }

        // 注册新的 HTTP 服务器
        for (const server of addedHttpServers) {
            if (server.enable) {
                let adapter = new OB11PassiveHttpAdapter(server.name, server, this.core, this.actions);
                adapter.open();
                this.networkManager.registerAdapter(adapter);
            }
        }

        // 注册新的 HTTP 客户端
        for (const client of addedHttpClients) {

            if (client.enable) {
                let adapter = new OB11ActiveHttpAdapter(client.name, client, this.core, this, this.actions);
                adapter.open();
                this.networkManager.registerAdapter(adapter);
            }
        }

        // 注册新的 WebSocket 服务器
        for (const server of addedWebSocketServers) {
            if (server.enable) {
                let adapter = new OB11PassiveWebSocketAdapter(
                    server.name,
                    server,
                    this.core,
                    this.actions
                );
                adapter.open();
                this.networkManager.registerAdapter(adapter);
            }
        }

        // 注册新的 WebSocket 客户端
        for (const client of addedWebSocketClients) {
            if (client.enable) {
                let adapter = new OB11ActiveWebSocketAdapter(
                    client.name,
                    client,
                    this.core,
                    this.actions
                )
                adapter.open();
                this.networkManager.registerAdapter(adapter);
            }
        }
    }

    private findDifference<T>(prev: T[], now: T[]): { added: T[]; removed: T[] } {
        const added = now.filter((item) => !prev.includes(item));
        const removed = prev.filter((item) => !now.includes(item));
        return { added, removed };
    }

    private initMsgListener() {
        const msgListener = new NodeIKernelMsgListener();
        msgListener.onRecvSysMsg = (msg) => {
            this.apis.MsgApi.parseSysMessage(msg)
                .then((event) => {
                    if (event) this.networkManager.emitEvent(event);
                })
                .catch((e) =>
                    this.context.logger.logError.bind(this.context.logger)(
                        'constructSysMessage error: ',
                        e,
                        '\n Parse Hex:',
                        Buffer.from(msg).toString('hex')
                    )
                );
        };

        msgListener.onInputStatusPush = async (data) => {
            const uin = await this.core.apis.UserApi.getUinByUidV2(data.fromUin);
            this.context.logger.log(`[Notice] [输入状态] ${uin} ${data.statusText}`);
            await this.networkManager.emitEvent(
                new OB11InputStatusEvent(this.core, parseInt(uin), data.eventType, data.statusText)
            );
        };

        msgListener.onRecvMsg = async (msg) => {
            for (const m of msg) {
                if (this.bootTime > parseInt(m.msgTime)) {
                    this.context.logger.logDebug(`消息时间${m.msgTime}早于启动时间${this.bootTime}，忽略上报`);
                    continue;
                }
                m.id = MessageUnique.createUniqueMsgId(
                    {
                        chatType: m.chatType,
                        peerUid: m.peerUid,
                        guildId: '',
                    },
                    m.msgId
                );
                await this.emitMsg(m).catch((e) =>
                    this.context.logger.logError.bind(this.context.logger)('处理消息失败', e)
                );
            }
        };

        const msgIdSend = new LRUCache<string, number>(100);
        const recallMsgs = new LRUCache<string, boolean>(100);
        msgListener.onAddSendMsg = async (msg) => {
            if (msg.sendStatus == SendStatusType.KSEND_STATUS_SENDING) {
                msgIdSend.put(msg.msgId, 0);
            }
        };
        msgListener.onMsgInfoListUpdate = async (msgList) => {
            this.emitRecallMsg(msgList, recallMsgs).catch((e) =>
                this.context.logger.logError.bind(this.context.logger)('处理消息失败', e)
            );
            for (const msg of msgList.filter((e) => e.senderUin == this.core.selfInfo.uin)) {
                if (msg.sendStatus == SendStatusType.KSEND_STATUS_SUCCESS && msgIdSend.get(msg.msgId) == 0) {
                    msgIdSend.put(msg.msgId, 1);
                    // 完成后再post
                    msg.id = MessageUnique.createUniqueMsgId(
                        {
                            chatType: msg.chatType,
                            peerUid: msg.peerUid,
                            guildId: '',
                        },
                        msg.msgId
                    );
                    this.emitMsg(msg);
                }
            }
        };
        msgListener.onKickedOffLine = async (kick) => {
            const event = new BotOfflineEvent(this.core, kick.tipsTitle, kick.tipsDesc);
            this.networkManager
                .emitEvent(event)
                .catch((e) => this.context.logger.logError.bind(this.context.logger)('处理Bot掉线失败', e));
        };
        this.context.session.getMsgService().addKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger));
    }

    private initBuddyListener() {
        const buddyListener = new NodeIKernelBuddyListener();

        buddyListener.onBuddyReqChange = async (reqs) => {
            this.core.apis.FriendApi.clearBuddyReqUnreadCnt();
            for (let i = 0; i < reqs.unreadNums; i++) {
                const req = reqs.buddyReqs[i];
                if (!!req.isInitiator || (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM)) {
                    continue;
                }
                try {
                    const requesterUin = await this.core.apis.UserApi.getUinByUidV2(req.friendUid);
                    await this.networkManager.emitEvent(
                        new OB11FriendRequestEvent(
                            this.core,
                            +requesterUin,
                            req.extWords,
                            req.friendUid + '|' + req.reqTime
                        )
                    );
                } catch (e) {
                    this.context.logger.logDebug('获取加好友者QQ号失败', e);
                }
            }
        };

        this.context.session
            .getBuddyService()
            .addKernelBuddyListener(proxiedListenerOf(buddyListener, this.context.logger));
    }

    private initGroupListener() {
        const groupListener = new NodeIKernelGroupListener();

        groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
            //console.log('ob11 onGroupNotifiesUpdated', notifies[0]);
            await this.core.apis.GroupApi.clearGroupNotifiesUnreadCount(false);
            if (
                ![
                    GroupNotifyMsgType.SET_ADMIN,
                    GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
                    GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
                ].includes(notifies[0]?.type)
            ) {
                for (const notify of notifies) {
                    const notifyTime = parseInt(notify.seq) / 1000 / 1000;
                    // log(`群通知时间${notifyTime}`, `启动时间${this.bootTime}`);
                    if (notifyTime < this.bootTime) {
                        continue;
                    }

                    const flag = notify.group.groupCode + '|' + notify.seq + '|' + notify.type;
                    this.context.logger.logDebug('收到群通知', notify);

                    if (
                        [
                            GroupNotifyMsgType.SET_ADMIN,
                            GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
                            GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
                        ].includes(notify.type)
                    ) {
                        const member1 = await this.core.apis.GroupApi.getGroupMember(
                            notify.group.groupCode,
                            notify.user1.uid
                        );
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
                                ].includes(notify.type)
                                    ? 'unset'
                                    : 'set'
                            );
                            this.networkManager
                                .emitEvent(groupAdminNoticeEvent)
                                .catch((e) =>
                                    this.context.logger.logError.bind(this.context.logger)('处理群管理员变动失败', e)
                                );
                        } else {
                            this.context.logger.logDebug(
                                '获取群通知的成员信息失败',
                                notify,
                                this.core.apis.GroupApi.getGroup(notify.group.groupCode)
                            );
                        }
                    } else if (
                        notify.type == GroupNotifyMsgType.MEMBER_LEAVE_NOTIFY_ADMIN ||
                        notify.type == GroupNotifyMsgType.KICK_MEMBER_NOTIFY_ADMIN
                    ) {
                        this.context.logger.logDebug('有成员退出通知', notify);
                        const member1Uin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
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
                        this.networkManager
                            .emitEvent(groupDecreaseEvent)
                            .catch((e) =>
                                this.context.logger.logError.bind(this.context.logger)('处理群成员退出失败', e)
                            );
                        // notify.status == 1 表示未处理 2表示处理完成
                    } else if (
                        [GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS].includes(notify.type) &&
                        notify.status == GroupNotifyMsgStatus.KUNHANDLE
                    ) {
                        this.context.logger.logDebug('有加群请求');
                        try {
                            let requestUin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
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
                            this.networkManager
                                .emitEvent(groupRequestEvent)
                                .catch((e) =>
                                    this.context.logger.logError.bind(this.context.logger)('处理加群请求失败', e)
                                );
                        } catch (e) {
                            this.context.logger.logError.bind(this.context.logger)(
                                '获取加群人QQ号失败 Uid:',
                                notify.user1.uid,
                                e
                            );
                        }
                    } else if (
                        notify.type == GroupNotifyMsgType.INVITED_BY_MEMBER &&
                        notify.status == GroupNotifyMsgStatus.KUNHANDLE
                    ) {
                        this.context.logger.logDebug(`收到邀请我加群通知:${notify}`);
                        const groupInviteEvent = new OB11GroupRequestEvent(
                            this.core,
                            parseInt(notify.group.groupCode),
                            parseInt(await this.core.apis.UserApi.getUinByUidV2(notify.user2.uid)),
                            'invite',
                            notify.postscript,
                            flag
                        );
                        this.networkManager
                            .emitEvent(groupInviteEvent)
                            .catch((e) =>
                                this.context.logger.logError.bind(this.context.logger)('处理邀请本人加群失败', e)
                            );
                    } else if (
                        notify.type == GroupNotifyMsgType.INVITED_NEED_ADMINI_STRATOR_PASS &&
                        notify.status == GroupNotifyMsgStatus.KUNHANDLE
                    ) {
                        this.context.logger.logDebug(`收到群员邀请加群通知:${notify}`);
                        const groupInviteEvent = new OB11GroupRequestEvent(
                            this.core,
                            parseInt(notify.group.groupCode),
                            parseInt(await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid)),
                            'add',
                            notify.postscript,
                            flag
                        );
                        this.networkManager
                            .emitEvent(groupInviteEvent)
                            .catch((e) =>
                                this.context.logger.logError.bind(this.context.logger)('处理邀请本人加群失败', e)
                            );
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
                        member.role === GroupMemberRole.admin ? 'set' : 'unset'
                    );
                    this.networkManager
                        .emitEvent(groupAdminNoticeEvent)
                        .catch((e) =>
                            this.context.logger.logError.bind(this.context.logger)('处理群管理员变动失败', e)
                        );
                    existMember.isChangeRole = false;
                    this.context.logger.logDebug.bind(this.context.logger)('群管理员变动处理完毕');
                });
            }
        };

        this.context.session
            .getGroupService()
            .addKernelGroupListener(proxiedListenerOf(groupListener, this.context.logger));
    }

    private async emitMsg(message: RawMessage) {
        const network = Object.values(this.configLoader.configData.network) as Array<
            (typeof this.configLoader.configData.network)[keyof typeof this.configLoader.configData.network]
        >;
        this.context.logger.logDebug('收到新消息 RawMessage', message);
        this.apis.MsgApi.parseMessageV2(message)
            .then((ob11Msg) => {
                if (!ob11Msg) return;
                const isSelfMsg =
                    ob11Msg.stringMsg.user_id.toString() == this.core.selfInfo.uin ||
                    ob11Msg.arrayMsg.user_id.toString() == this.core.selfInfo.uin;
                this.context.logger.logDebug('转化为 OB11Message', ob11Msg);
                const msgMap: Map<string, OB11Message> = new Map();
                const enable_client: string[] = [];
                network
                    .flat()
                    .filter((e) => e.enable)
                    .map((e) => {
                        enable_client.push(e.name);
                        if (e.messagePostFormat == 'string') {
                            msgMap.set(e.name, structuredClone(ob11Msg.stringMsg));
                        } else {
                            msgMap.set(e.name, structuredClone(ob11Msg.arrayMsg));
                        }
                        if (isSelfMsg) {
                            ob11Msg.stringMsg.target_id = parseInt(message.peerUin);
                            ob11Msg.arrayMsg.target_id = parseInt(message.peerUin);
                        }
                    });

                const debug_network = network.flat().filter((e) => e.enable && e.debug);
                if (debug_network.length > 0) {
                    for (const adapter of debug_network) {
                        if (adapter.name) {
                            const msg = msgMap.get(adapter.name);
                            if (msg) {
                                msg.raw = message;
                            }
                        }
                    }
                } else if (ob11Msg.stringMsg.message.length === 0 || ob11Msg.arrayMsg.message.length == 0) {
                    return;
                }
                const notreportSelf_network = network.flat().filter((e) => e.enable && (('reportSelfMessage' in e && !e.reportSelfMessage) || !('reportSelfMessage' in e)));
                if (isSelfMsg) {
                    for (const adapter of notreportSelf_network) {
                        msgMap.delete(adapter.name);
                    }
                }

                this.networkManager.emitEventByNames(msgMap);
            })
            .catch((e) => this.context.logger.logError.bind(this.context.logger)('constructMessage error: ', e));

        this.apis.GroupApi.parseGroupEvent(message)
            .then((groupEvent) => {
                if (groupEvent) {
                    // log("post group event", groupEvent);
                    this.networkManager.emitEvent(groupEvent);
                }
            })
            .catch((e) => this.context.logger.logError.bind(this.context.logger)('constructGroupEvent error: ', e));

        this.apis.MsgApi.parsePrivateMsgEvent(message)
            .then((privateEvent) => {
                if (privateEvent) {
                    // log("post private event", privateEvent);
                    this.networkManager.emitEvent(privateEvent);
                }
            })
            .catch((e) => this.context.logger.logError.bind(this.context.logger)('constructPrivateEvent error: ', e));
    }
    private async emitRecallMsg(msgList: RawMessage[], cache: LRUCache<string, boolean>) {
        for (const message of msgList) {
            // log("message update", message.sendStatus, message.msgId, message.msgSeq)
            const peer: Peer = { chatType: message.chatType, peerUid: message.peerUid, guildId: '' };
            if (message.recallTime != '0' && !cache.get(message.msgId)) {
                //work:这个判断方法不太好，应该使用灰色消息元素来判断?
                cache.put(message.msgId, true);
                // 撤回消息上报
                let oriMessageId = MessageUnique.getShortIdByMsgId(message.msgId);
                if (!oriMessageId) {
                    oriMessageId = MessageUnique.createUniqueMsgId(peer, message.msgId);
                }
                if (message.chatType == ChatType.KCHATTYPEC2C) {
                    const friendRecallEvent = new OB11FriendRecallNoticeEvent(
                        this.core,
                        +message.senderUin,
                        oriMessageId
                    );
                    this.networkManager
                        .emitEvent(friendRecallEvent)
                        .catch((e) =>
                            this.context.logger.logError.bind(this.context.logger)('处理好友消息撤回失败', e)
                        );
                } else if (message.chatType == ChatType.KCHATTYPEGROUP) {
                    let operatorId = message.senderUin;
                    for (const element of message.elements) {
                        const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
                        if (!operatorUid) return;
                        const operator = await this.core.apis.GroupApi.getGroupMember(message.peerUin, operatorUid);
                        operatorId = operator?.uin ?? message.senderUin;
                    }
                    const groupRecallEvent = new OB11GroupRecallNoticeEvent(
                        this.core,
                        +message.peerUin,
                        +message.senderUin,
                        +operatorId,
                        oriMessageId
                    );
                    this.networkManager
                        .emitEvent(groupRecallEvent)
                        .catch((e) => this.context.logger.logError.bind(this.context.logger)('处理群消息撤回失败', e));
                }
            }
        }
    }
}

export * from './types';
