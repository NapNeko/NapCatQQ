import { LogWrapper } from "@/common/utils/log";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { NapCatCoreWorkingEnv } from "@/core";
import { SelfInfo } from "../entities";
import { NodeIKernelLoginService } from "../services";
import { WrapperNodeApi, NodeIQQNTWrapperSession } from "@/core";
import { NTQQFriendApi, NTQQGroupApi, NTQQMsgApi, NTQQUserApi } from "../apis";

export interface InstanceContext {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;
    readonly basicInfoWrapper: QQBasicInfoWrapper;
}
export interface NTApiContext {
    FriendApi: NTQQFriendApi,
    MsgApi: NTQQMsgApi,
    UserApi: NTQQUserApi,
    GroupApi: NTQQGroupApi
}