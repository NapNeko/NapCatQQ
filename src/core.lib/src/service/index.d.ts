import { NapCatCoreServiceMessage } from './message';
import { NapCatCoreServiceGroup } from './group';
import { NapCatCoreServiceBuddy } from './buddy';
import { NapCatCoreServiceProfile } from './profile';
import { NapCatCoreServiceProfileLike } from './profileLike';
import { NodeIKernelBuddyService, NodeIKernelGroupService, NodeIKernelMsgService, NodeIKernelProfileService, NodeIKernelProfileLikeService } from '../qqnt/services';
import { NapCatCore } from '..';
/**
 * NapCat 服务相关核心类
 *
 * 本核心类分有三个小类，分别为 `messgae`、`group` 和 `buddy` 类。每个小类内包含其服务和监听器。
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreService {
    private isInit;
    private readonly core;
    msg: NapCatCoreServiceMessage;
    group: NapCatCoreServiceGroup;
    buddy: NapCatCoreServiceBuddy;
    profile: NapCatCoreServiceProfile;
    profileLike: NapCatCoreServiceProfileLike;
    constructor(core: NapCatCore);
    /**
     * 初始化服务，需在初始化 WrapperSession 后调用。相关服务请通过调用初始化后的 WrapperSession 获取。
     * @param {NodeIKernelMsgService} msg 消息通知服务
     * @param {NodeIKernelGroupService} group 群聊相关服务
     * @param {NodeIKernelBuddyService} buddy 好友相关服务
     * @param profile
     * @param profileLike
     * @returns {void}
     */
    init(msg: NodeIKernelMsgService, group: NodeIKernelGroupService, buddy: NodeIKernelBuddyService, profile: NodeIKernelProfileService, profileLike: NodeIKernelProfileLikeService): void;
    private initListener;
}
