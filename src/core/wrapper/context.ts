import { LogWrapper } from '@/common/log';
import { QQBasicInfoWrapper } from '@/common/qq-basic-info';
import { NapCatCoreWorkingEnv, NodeIKernelLoginService, NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core';
import { NTQQFileApi, NTQQFriendApi, NTQQGroupApi, NTQQMsgApi, NTQQSystemApi, NTQQUserApi, NTQQWebApi } from '../apis';
import { NTQQCollectionApi } from '../apis/collection';
import { NapCatPathWrapper } from '@/common/path';

export interface InstanceContext {
    readonly workingEnv: NapCatCoreWorkingEnv;
    readonly wrapper: WrapperNodeApi;
    readonly session: NodeIQQNTWrapperSession;
    readonly logger: LogWrapper;
    readonly loginService: NodeIKernelLoginService;
    readonly basicInfoWrapper: QQBasicInfoWrapper;
    readonly pathWrapper: NapCatPathWrapper;
}

export interface StableNTApiWrapper {
    FileApi: NTQQFileApi,
    SystemApi: NTQQSystemApi,
    CollectionApi: NTQQCollectionApi,
    WebApi: NTQQWebApi,
    FriendApi: NTQQFriendApi,
    MsgApi: NTQQMsgApi,
    UserApi: NTQQUserApi,
    GroupApi: NTQQGroupApi
}
