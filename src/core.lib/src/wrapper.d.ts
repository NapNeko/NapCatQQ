import { NodeIQQNTWrapperEngine, NodeQQNTWrapperUtil, EnginInitDesktopConfig } from './qqnt/wrapper';
import { NodeIGlobalAdapter } from './qqnt/adapters';
/**
 * NapCat Wrapper 相关核心类
 *
 * **【注意】**：本类初始化分为两个阶段，请参考本类的 `init` 和 `initPostLogin` 方法。
 */
export declare class NapCatCoreWrapper {
    engine: NodeIQQNTWrapperEngine;
    util: NodeQQNTWrapperUtil;
    constructor();
    /**
     * 获取 QQNT 的数据目录
     * @returns {string} 数据目录绝对位置
     */
    get dataPath(): string;
    /**
     * 获取 QQNT 的全局数据目录
     * @returns {string} 数据目录绝对位置
     */
    get dataPathGlobal(): string;
    /**
     * 初始化 Wrapper。本方法应当在应用被创建时调用
     * @param {EnginInitDesktopConfig} engineConfig WrapperEngine 配置参数
     * @param {NodeIGlobalAdapter} globalAdapter 适配器，暂时未知其作用，待补充
     * @returns {void}
     */
    init(engineConfig: EnginInitDesktopConfig, globalAdapter: NodeIGlobalAdapter): void;
}
