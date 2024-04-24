import { NapCatCore } from '.';
import { LoginInitConfig, NodeIKernelLoginService } from './qqnt/services';
import { LoginListener } from './qqnt/listeners';

/**
 * NapCat 登录相关核心类
 *
 * **【注意】**：只有在调用 `init` 方法后才会被真正初始化！
 */
export declare class NapCatCoreLogin {
    readonly core: NapCatCore;
    readonly service: NodeIKernelLoginService;
    readonly listener: LoginListener;
    constructor(core: NapCatCore);
    /**
     * 初始化 `NodeIKernelLoginService`
     * @param {LoginInitConfig} config `NodeIKernelLoginService` 初始化配置
     * @returns {void}
     */
    init(config: LoginInitConfig): void;
    /**
     * 初始化监听器，用于向父级 `NapCatCore` 发送事件
     */
    private initListener;
    /**
     * 获取在此客户端上登录过的账号列表
     * @returns {Promise<{ result: number, LocalLoginInfoList: LoginListItem[] }>}
     */
    private getLoginList;
    /**
     * 使用二维码方式登录账号，获取到的二维码链接可通过 `system.login.qrcode` 事件获取。
     */
    qrcode(): Promise<void>;
    /**
     * 使用快速登录方式登录账号，欲登录的账号必须在此客户端上登录过
     * @param {string} uin 欲登录账户的 Uin
     * @returns {Promise<void>}
     */
    quick(uin: string): Promise<void>;
    /**
     * 使用账号密码方式登录，需要滑块验证会发送 `system.login.slider` 事件，登录错误会发送 `system.login.error` 事件。
     * @param {string} uin 登录账号
     * @param {string} password 登录密码
     * @param {string} [proofSig] 验证码返回的 ticket
     * @param {string} [proofRand] 验证码返回的随机字符串值
     * @param {string} [proofSid] 验证码的 sid
     */
    password(uin: string, password: string, proofSig?: string, proofRand?: string, proofSid?: string): Promise<void>;
}
