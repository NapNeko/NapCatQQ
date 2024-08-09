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
import SetFriendAddRequest from './user/SetFriendAddRequest';
import SetGroupWholeBan from './group/SetGroupWholeBan';
import SetGroupName from './group/SetGroupName';
import SetGroupBan from './group/SetGroupBan';
import SetGroupKick from './group/SetGroupKick';
import SetGroupAdmin from './group/SetGroupAdmin';
import SetGroupCard from './group/SetGroupCard';
import GetImage from './file/GetImage';
import GetRecord from './file/GetRecord';
import { GoCQHTTPMarkMsgAsRead, MarkAllMsgAsRead, MarkGroupMsgAsRead, MarkPrivateMsgAsRead } from './msg/MarkMsgAsRead';
import GoCQHTTPUploadGroupFile from './go-cqhttp/UploadGroupFile';
import GetGroupAddRequest from '@/onebot/action/extends/GetGroupAddRequest';
import SetQQAvatar from '@/onebot/action/extends/SetQQAvatar';
import GoCQHTTPDownloadFile from './go-cqhttp/DownloadFile';
import GoCQHTTPGetGroupMsgHistory from './go-cqhttp/GetGroupMsgHistory';
import GetFile from './file/GetFile';
import { GoCQHTTPGetForwardMsgAction } from './go-cqhttp/GetForwardMsg';
import GetFriendMsgHistory from './go-cqhttp/GetFriendMsgHistory';
import { GetCookies } from './user/GetCookies';
import { SetMsgEmojiLike } from '@/onebot/action/msg/SetMsgEmojiLike';
import { GetRobotUinRange } from './extends/GetRobotUinRange';
import { SetOnlineStatus } from './extends/SetOnlineStatus';
import { GetGroupNotice } from './group/GetGroupNotice';
import { GetGroupEssence } from './group/GetGroupEssence';
import { ForwardFriendSingleMsg, ForwardGroupSingleMsg } from '@/onebot/action/msg/ForwardSingleMsg';
import { GetFriendWithCategory } from './extends/GetFriendWithCategory';
import { SendGroupNotice } from './go-cqhttp/SendGroupNotice';
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
import { GetProfileLike } from './extends/GetProfileLike';
import SetGroupHeader from './extends/SetGroupHeader';
import { FetchCustomFace } from './extends/FetchCustomFace';
import GoCQHTTPUploadPrivateFile from './go-cqhttp/UploadPrivareFile';
import { FetchEmojioLike } from './extends/FetchEmojioLike';
import { NapCatCore } from '@/core';

export function createActionMap(context: NapCatCore) {
    const actionHandlers = [
        new FetchEmojioLike(context),
        new GetFile(context),
        new SetSelfProfile(context),
        new shareGroupEx(context),
        new sharePeer(context),
        new CreateCollection(context),
        new SetLongNick(context),
        new ForwardFriendSingleMsg(context),
        new ForwardGroupSingleMsg(context),
        new MarkGroupMsgAsRead(context),
        new MarkPrivateMsgAsRead(context),
        new SetQQAvatar(context),
        new TranslateEnWordToZn(context),
        new GetGroupFileCount(context),
        new GetGroupFileList(context),
        new SetGroupFileFolder(context),
        new DelGroupFile(context),
        new DelGroupFileFolder(context),
        // onebot11
        new SendLike(context),
        new GetMsg(context),
        new GetLoginInfo(context),
        new GetFriendList(context),
        new GetGroupList(context),
        new GetGroupInfo(context),
        new GetGroupMemberList(context),
        new GetGroupMemberInfo(context),
        new SendGroupMsg(context),
        new SendPrivateMsg(context),
        new SendMsg(context),
        new DeleteMsg(context),
        new SetGroupAddRequest(context),
        new SetFriendAddRequest(context),
        new SetGroupLeave(context),
        new GetVersionInfo(context),
        new CanSendRecord(context),
        new CanSendImage(context),
        new GetStatus(context),
        new SetGroupWholeBan(context),
        new SetGroupBan(context),
        new SetGroupKick(context),
        new SetGroupAdmin(context),
        new SetGroupName(context),
        new SetGroupCard(context),
        new GetImage(context),
        new GetRecord(context),
        new SetMsgEmojiLike(context),
        new GetCookies(context),
        new SetOnlineStatus(context),
        new GetRobotUinRange(context),
        new GetFriendWithCategory(context),
        //以下为go-cqhttp api
        new GetOnlineClient(context),
        new OCRImage(context),
        new IOCRImage(context),
        new GetGroupHonorInfo(context),
        new SendGroupNotice(context),
        new GetGroupNotice(context),
        new GetGroupEssence(context),
        new GoCQHTTPSendForwardMsg(context),
        new GoCQHTTPSendGroupForwardMsg(context),
        new GoCQHTTPSendPrivateForwardMsg(context),
        new GoCQHTTPGetStrangerInfo(context),
        new GoCQHTTPDownloadFile(context),
        new GetGuildList(context),
        new GoCQHTTPMarkMsgAsRead(context),
        new GoCQHTTPUploadGroupFile(context),
        new GoCQHTTPGetGroupMsgHistory(context),
        new GoCQHTTPGetForwardMsgAction(context),
        new GetFriendMsgHistory(context),
        new GoCQHTTPHandleQuickAction(context),
        new GetGroupSystemMsg(context),
        new DelEssenceMsg(context),
        new SetEssenceMsg(context),
        new GetRecentContact(context),
        new MarkAllMsgAsRead(context),
        new GetProfileLike(context),
        new SetGroupHeader(context),
        new FetchCustomFace(context),
        new GoCQHTTPUploadPrivateFile(context)
    ];
    const actionMap = new Map<string, BaseAction<any, any>>();
    for (const action of actionHandlers) {
        actionMap.set(action.actionName, action);
        actionMap.set(action.actionName + '_async', action);
        actionMap.set(action.actionName + '_rate_limited', action);
    }

    return actionMap;
}
