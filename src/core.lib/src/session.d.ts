import { NodeIQQNTWrapperSession } from './qqnt/wrapper';
import { SessionListener } from './qqnt/listeners';
/**
 * NapCat WrapperSession 相关核心类
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreSession {
    wrapper: NodeIQQNTWrapperSession;
    readonly listener: SessionListener;
    constructor();
    /**
     * 初始化 Wrapper。本方法应当在登陆成功后调用。
     * @param {string} uin 登陆账号的 uin
     * @param {string} uid 登陆账号的 uid
     * @param dataPath
     * @returns {Promise<number>} 返回回调状态码，不为 `0` 则抛出错误。
     */
    init(uin: string, uid: string, dataPath: string): Promise<number>;
}
