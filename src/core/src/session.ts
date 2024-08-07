import type { NodeIQQNTWrapperSession, NodeQQNTWrapperUtil, WrapperNodeApi } from '@/core/wrapper';
import { NTEventWrapper } from '@/common/utils/EventTask';
import { NTQQUserApi, NTQQFileApi, NTQQFileCacheApi, NTQQSystemApi, NTQQFriendApi, NTQQGroupApi, NTQQMsgApi, WebApi } from '@/core/napis';
export type ApiContext = { core: NTCoreWrapper, event: NTEventWrapper, util: NodeQQNTWrapperUtil };
//注入与管理会话
export class NTCoreWrapper {
    public session: NodeIQQNTWrapperSession;
    public util: NodeQQNTWrapperUtil;
    public event: NTEventWrapper;
    //--------
    public ApiFile: NTQQFileApi;
    public ApiFileCache: NTQQFileCacheApi;
    public ApiFriend: NTQQFriendApi;
    public ApiGroup: NTQQGroupApi;
    public ApiMsg: NTQQMsgApi;
    public ApiSystem: NTQQSystemApi;
    public ApiUser: NTQQUserApi;
    public ApiWeb: WebApi;

    constructor(QQWrapper: WrapperNodeApi, session: NodeIQQNTWrapperSession) {
        this.session = session;
        this.util = new QQWrapper.NodeQQNTWrapperUtil();
        this.event = new NTEventWrapper();
        this.event.init({
            ListenerMap: QQWrapper,
            WrapperSession: this.session
        });
        //Api类处理
        let context: ApiContext = { core: this, event: this.event, util: this.util };
        this.ApiFile = new NTQQFileApi(context);
        this.ApiFileCache = new NTQQFileCacheApi(context);
        this.ApiFriend = new NTQQFriendApi(context);
        this.ApiGroup = new NTQQGroupApi(context);
        this.ApiMsg = new NTQQMsgApi(context);
        this.ApiSystem = new NTQQSystemApi(context);
        this.ApiUser = new NTQQUserApi(context);
        this.ApiWeb = new WebApi(context);
    }
    // 基础函数
    getWrapperSession() {
        return this.session;
    }
    getWrapperUtil() {
        return this.util;
    }
    // Api类获取
    getApiFile() {
        return this.ApiFile;
    }
    getApiFileCache() {
        return this.ApiFileCache;
    }
    getApiFriend() {
        return this.ApiFriend;
    }
    getApiGroup() {
        return this.ApiGroup;
    }
    getApiMsg() {
        return this.ApiMsg;
    }
    getApiSystem() {
        return this.ApiSystem;
    }
    getApiUser() {
        return this.ApiUser;
    }
    getApiWeb() {
        return this.ApiWeb;
    }
}