import { InstanceContext, MsgListener, NapCatCore, RawMessage } from '@/core';
import { OB11Config } from './helper/config';
import { NapCatPathWrapper } from '@/common/framework/napcat';
import { OneBotApiContextType } from './types/adapter';
import { OneBotFriendApi, OneBotGroupApi, OneBotUserApi } from './api';
import { OB11ActiveHttpAdapter, OB11ActiveWebSocketAdapter, OB11NetworkManager, OB11PassiveHttpAdapter, OB11PassiveWebSocketAdapter } from '@/onebot/network';
import { OB11InputStatusEvent } from '@/onebot/event/notice/OB11InputStatusEvent';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { OB11Constructor } from '@/onebot/helper/data';
import { logOB11Message } from '@/onebot/helper/log';
import { proxiedListenerOf } from '@/common/utils/proxy-handler';
import { createActionMap } from './action';
import { InitWebUi } from '@/webui';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';

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
        const NTQQUserApi = this.core.getApiContext().UserApi;
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
        let actions = createActionMap(this, this.core);
        if (ob11Config.http.enable) {
            await this.networkManager.registerAdapter(new OB11PassiveHttpAdapter(
                ob11Config.http.port, ob11Config.token, this.core, this
            ));
        }
        if (ob11Config.http.enablePost) {
            ob11Config.http.postUrls.forEach(async url => {
                await this.networkManager.registerAdapter(new OB11ActiveHttpAdapter(
                    url, ob11Config.heartInterval, ob11Config.token, this.core, this
                ));
            });
        }
        if (ob11Config.ws.enable) {
            let OBPassiveWebSocketAdapter = new OB11PassiveWebSocketAdapter(
                ob11Config.ws.host, ob11Config.ws.port, ob11Config.heartInterval, ob11Config.token, this.core, this
            )
           await this.networkManager.registerAdapter(OBPassiveWebSocketAdapter);
        }
        if (ob11Config.reverseWs.enable) {
            ob11Config.reverseWs.urls.forEach(async url => {
                await this.networkManager.registerAdapter(new OB11ActiveWebSocketAdapter(
                    url, 5000, ob11Config.heartInterval, this.core, this
                ));
            });
        }

        await this.networkManager.registerAllActions(actions);
        await this.networkManager.openAllAdapters();
        await this.initMsgListener();
        WebUiDataRuntime.setQQLoginUin(selfInfo.uin.toString());
        WebUiDataRuntime.setQQLoginStatus(true);
        InitWebUi(this.context.logger, this.context.pathWrapper).then().catch(this.context.logger.logError);
    }

    async initMsgListener() {
        const msgListener = new MsgListener();

        msgListener.onInputStatusPush = async data => {
            const uin = await this.core.ApiContext.UserApi.getUinByUidV2(data.fromUin);
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
                await this.postReceiveMsg(m)
                    .catch(e => this.context.logger.logError('处理消息失败', e));
            }
        };

        this.context.session.getMsgService().addKernelMsgListener(
            new this.context.wrapper.NodeIKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger)),
        );
    }

    async postReceiveMsg(message: RawMessage) {
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
            this.networkManager.emitEvent(ob11Msg).then().catch(e => this.context.logger.logError('emitEvent error: ', e));
        }).catch(e => this.context.logger.logError('constructMessage error: ', e));

        OB11Constructor.GroupEvent(this.core, message).then(groupEvent => {
            if (groupEvent) {
                // log("post group event", groupEvent);
                this.networkManager.emitEvent(groupEvent).then().catch(e => this.context.logger.logError('emitEvent error: ', e));
            }
        }).catch(e => this.context.logger.logError('constructGroupEvent error: ', e));

        OB11Constructor.PrivateEvent(this.core, message).then(privateEvent => {
            if (privateEvent) {
                // log("post private event", privateEvent);
                this.networkManager.emitEvent(privateEvent).then().catch(e => this.context.logger.logError('emitEvent error: ', e));
            }
        });
    }
}
