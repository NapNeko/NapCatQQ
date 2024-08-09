import { LogWrapper } from "@/common/utils/log";
import { QQBasicInfoWrapper } from "@/common/utils/QQBasicInfo";
import { NapCatCoreWorkingEnv } from "@/core";
import { SelfInfo } from "../entities";
import { NodeIKernelLoginService } from "../services";
import { WrapperNodeApi, NodeIQQNTWrapperSession } from "@/core";

export interface InstanceContext {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;
    readonly basicInfoWrapper: QQBasicInfoWrapper;
}
