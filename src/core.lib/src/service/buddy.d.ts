import { NodeIKernelBuddyService } from '../qqnt/services';
import { BuddyListener } from '../qqnt/listeners';

/**
 * NapCat 服务相关核心好友子类
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreServiceBuddy {
    kernelService: NodeIKernelBuddyService | null;
    readonly listener: BuddyListener;
    constructor();
    /**
     * 初始化好友服务
     * @param {NodeIKernelBuddyService} service 好友服务
     * @returns {void}
     */
    init(service: NodeIKernelBuddyService): void;
    addBuddyListener(listener: BuddyListener): void;
}
