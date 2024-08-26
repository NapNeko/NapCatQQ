import { OneBotFriendApi, OneBotGroupApi, OneBotMsgApi, OneBotUserApi } from '../api';

export interface StableOneBotApiWrapper {
    FriendApi: OneBotFriendApi;
    UserApi: OneBotUserApi;
    GroupApi: OneBotGroupApi;
    MsgApi: OneBotMsgApi;
}
