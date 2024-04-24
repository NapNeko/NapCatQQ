import { NodeIKernelGroupService } from '../qqnt/services';
import { GroupListener } from '../qqnt/listeners';

/**
 * NapCat 服务相关核心群聊子类
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreServiceGroup {
    kernelService: NodeIKernelGroupService | null;
    readonly listener: GroupListener;
    constructor();
    /**
     * 初始化群聊服务
     * @param {NodeIKernelGroupService} service 群聊服务
     * @returns {void}
     */
    init(service: NodeIKernelGroupService): void;
    addGroupListener(listener: GroupListener): number | undefined;
}
