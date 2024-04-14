import { MsgListener } from '../qqnt/listeners';
import { NodeIKernelMsgService } from '../qqnt/services';
/**
 * NapCat 服务相关核心消息子类
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreServiceMessage {
    kernelService: NodeIKernelMsgService | null;
    readonly listener: MsgListener;
    constructor();
    /**
     * 初始化消息服务
     * @param {NodeIKernelMsgService} service 消息服务
     * @returns {void}
     */
    init(service: NodeIKernelMsgService): void;
    addMsgListener(listener: MsgListener): void | undefined;
}
