import { OneBotFriendApi, OneBotGroupApi, OneBotUserApi } from '../api';

export interface OneBotApiContextType {
    FriendApi: OneBotFriendApi;
    UserApi: OneBotUserApi;
    GroupApi: OneBotGroupApi;
}
