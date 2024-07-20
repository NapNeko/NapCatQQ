import GetMsg from './msg/GetMsg';
import GetLoginInfo from './system/GetLoginInfo';
import GetFriendList from './user/GetFriendList';
import GetGroupList from './group/GetGroupList';
import GetGroupInfo from './group/GetGroupInfo';
import GetGroupMemberList from './group/GetGroupMemberList';
import GetGroupMemberInfo from './group/GetGroupMemberInfo';
import SendGroupMsg from './group/SendGroupMsg';
import SendPrivateMsg from './msg/SendPrivateMsg';
import SendMsg from './msg/SendMsg';
import DeleteMsg from './msg/DeleteMsg';
import BaseAction from './BaseAction';
import GetVersionInfo from './system/GetVersionInfo';
import CanSendRecord from './system/CanSendRecord';
import CanSendImage from './system/CanSendImage';
import GetStatus from './system/GetStatus';
import {
  GoCQHTTPSendForwardMsg,
  GoCQHTTPSendGroupForwardMsg,
  GoCQHTTPSendPrivateForwardMsg
} from './go-cqhttp/SendForwardMsg';
import GoCQHTTPGetStrangerInfo from './go-cqhttp/GetStrangerInfo';
import SendLike from './user/SendLike';
import SetGroupAddRequest from './group/SetGroupAddRequest';
import SetGroupLeave from './group/SetGroupLeave';
import GetGuildList from './group/GetGuildList';
import Debug from '@/onebot11/action/extends/Debug';
import SetFriendAddRequest from './user/SetFriendAddRequest';
import SetGroupWholeBan from './group/SetGroupWholeBan';
import SetGroupName from './group/SetGroupName';
import SetGroupBan from './group/SetGroupBan';
import SetGroupKick from './group/SetGroupKick';
import SetGroupAdmin from './group/SetGroupAdmin';
import SetGroupCard from './group/SetGroupCard';
import GetImage from './file/GetImage';
import GetRecord from './file/GetRecord';
import { GoCQHTTPMarkMsgAsRead, MarkGroupMsgAsRead, MarkPrivateMsgAsRead } from './msg/MarkMsgAsRead';
import CleanCache from './system/CleanCache';
import GoCQHTTPUploadGroupFile from './go-cqhttp/UploadGroupFile';
import { GetConfigAction, SetConfigAction } from '@/onebot11/action/extends/Config';
import GetGroupAddRequest from '@/onebot11/action/extends/GetGroupAddRequest';
import SetQQAvatar from '@/onebot11/action/extends/SetQQAvatar';
import GoCQHTTPDownloadFile from './go-cqhttp/DownloadFile';
import GoCQHTTPGetGroupMsgHistory from './go-cqhttp/GetGroupMsgHistory';
import GetFile from './file/GetFile';
import { GoCQHTTPGetForwardMsgAction } from './go-cqhttp/GetForwardMsg';
import GetFriendMsgHistory from './go-cqhttp/GetFriendMsgHistory';
import { GetCookies } from './user/GetCookies';
import { SetMsgEmojiLike } from '@/onebot11/action/msg/SetMsgEmojiLike';
import { GetRobotUinRange } from './extends/GetRobotUinRange';
import { SetOnlineStatus } from './extends/SetOnlineStatus';
import { GetGroupNotice } from './group/GetGroupNotice';
import { GetGroupEssence } from './group/GetGroupEssence';
import { ForwardFriendSingleMsg, ForwardGroupSingleMsg } from '@/onebot11/action/msg/ForwardSingleMsg';
import { GetFriendWithCategory } from './extends/GetFriendWithCategory';
import { SendGroupNotice } from './go-cqhttp/SendGroupNotice';
import { Reboot, RebootNormal } from './system/Reboot';
import { GetGroupHonorInfo } from './go-cqhttp/GetGroupHonorInfo';
import { GoCQHTTPHandleQuickAction } from './go-cqhttp/QuickAction';
import { GetGroupSystemMsg } from './group/GetGroupSystemMsg';
import { GetOnlineClient } from './go-cqhttp/GetOnlineClient';
import { IOCRImage, OCRImage } from './extends/OCRImage';
import { GetGroupFileCount } from './file/GetGroupFileCount';
import { GetGroupFileList } from './file/GetGroupFileList';
import { TranslateEnWordToZn } from './extends/TranslateEnWordToZn';
import { SetGroupFileFolder } from './file/SetGroupFileFolder';
import { DelGroupFile } from './file/DelGroupFile';
import { DelGroupFileFolder } from './file/DelGroupFileFolder';
import { SetSelfProfile } from './extends/SetSelfProfile';
import { shareGroupEx, sharePeer } from './extends/sharePeer';
import { CreateCollection } from './extends/CreateCollection';
import { SetLongNick } from './extends/SetLongNick';
import DelEssenceMsg from './group/DelEssenceMsg';
import SetEssenceMsg from './group/SetEssenceMsg';
import GetRecentContact from './user/GetRecentContact';

export const actionHandlers = [
  new RebootNormal(),
  new GetFile(),
  new Debug(),
  new Reboot(),
  new SetSelfProfile(),
  new shareGroupEx(),
  new sharePeer(),
  new CreateCollection(),
  new SetLongNick(),
  // new GetConfigAction(),
  // new SetConfigAction(),
  // new GetGroupAddRequest(),
  // TranslateEnWordToZn = "translate_en2zh",
  new ForwardFriendSingleMsg(),
  new ForwardGroupSingleMsg(),
  new MarkGroupMsgAsRead(),
  new MarkPrivateMsgAsRead(),
  new SetQQAvatar(),
  new TranslateEnWordToZn(),
  new GetGroupFileCount(),
  new GetGroupFileList(),
  new SetGroupFileFolder(),
  new DelGroupFile(),
  new DelGroupFileFolder(),
  // onebot11
  new SendLike(),
  new GetMsg(),
  new GetLoginInfo(),
  new GetFriendList(),
  new GetGroupList(), new GetGroupInfo(),
  new GetGroupMemberList(), new GetGroupMemberInfo(),
  new SendGroupMsg(), new SendPrivateMsg(), new SendMsg(),
  new DeleteMsg(),
  new SetGroupAddRequest(),
  new SetFriendAddRequest(),
  new SetGroupLeave(),
  new GetVersionInfo(),
  new CanSendRecord(),
  new CanSendImage(),
  new GetStatus(),
  new SetGroupWholeBan(),
  new SetGroupBan(),
  new SetGroupKick(),
  new SetGroupAdmin(),
  new SetGroupName(),
  new SetGroupCard(),
  new GetImage(),
  new GetRecord(),
  new SetMsgEmojiLike(),
  // new CleanCache(),
  new GetCookies(),
  //
  new SetOnlineStatus(),
  new GetRobotUinRange(),
  new GetFriendWithCategory(),
  //以下为go-cqhttp api
  new GetOnlineClient(),
  new OCRImage(),
  new IOCRImage(),
  new GetGroupHonorInfo(),
  new SendGroupNotice(),
  new GetGroupNotice(),
  new GetGroupEssence(),
  new GoCQHTTPSendForwardMsg(),
  new GoCQHTTPSendGroupForwardMsg(),
  new GoCQHTTPSendPrivateForwardMsg(),
  new GoCQHTTPGetStrangerInfo(),
  new GoCQHTTPDownloadFile(),
  new GetGuildList(),
  new GoCQHTTPMarkMsgAsRead(),
  new GoCQHTTPUploadGroupFile(),
  new GoCQHTTPGetGroupMsgHistory(),
  new GoCQHTTPGetForwardMsgAction(),
  new GetFriendMsgHistory(),
  new GoCQHTTPHandleQuickAction(),
  new GetGroupSystemMsg(),
  new DelEssenceMsg(),
  new SetEssenceMsg(),
  new GetRecentContact()
];

function initActionMap() {
  const actionMap = new Map<string, BaseAction<any, any>>();
  for (const action of actionHandlers) {
    actionMap.set(action.actionName, action);
    actionMap.set(action.actionName + '_async', action);
    actionMap.set(action.actionName + '_rate_limited', action);
  }

  return actionMap;
}

export const actionMap = initActionMap();
