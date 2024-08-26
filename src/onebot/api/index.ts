import { OneBotFriendApi } from '@/onebot/api/friend';
import { OneBotUserApi } from '@/onebot/api/user';
import { OneBotGroupApi } from '@/onebot/api/group';
import { OneBotMsgApi } from '@/onebot/api/msg';
import { OneBotQuickActionApi } from '@/onebot/api/quick-action';

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
