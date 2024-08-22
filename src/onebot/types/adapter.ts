import { OneBotFriendApi, OneBotGroupApi, OneBotMsgApi, OneBotUserApi } from '../api';

export interface OneBotApiContextType {
    FriendApi: OneBotFriendApi;
    UserApi: OneBotUserApi;
    GroupApi: OneBotGroupApi;
    MsgApi: OneBotMsgApi;
}
