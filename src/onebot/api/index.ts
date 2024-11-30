import type { OneBotFriendApi } from '@/onebot/api/friend';
import type { OneBotUserApi } from '@/onebot/api/user';
import type { OneBotGroupApi } from '@/onebot/api/group';
import type { OneBotMsgApi } from '@/onebot/api/msg';
import type { OneBotQuickActionApi } from '@/onebot/api/quick-action';

export * from './friend';
export * from './group';
export * from './user';
export * from './msg';
export * from './quick-action';

export interface StableOneBotApiWrapper {
    FriendApi: OneBotFriendApi;
    UserApi: OneBotUserApi;
    GroupApi: OneBotGroupApi;
    MsgApi: OneBotMsgApi;
    QuickActionApi: OneBotQuickActionApi,
}
