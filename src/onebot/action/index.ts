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
    GoCQHTTPSendPrivateForwardMsg,
} from './go-cqhttp/SendForwardMsg';
import GoCQHTTPGetStrangerInfo from './go-cqhttp/GetStrangerInfo';
import SendLike from './user/SendLike';
import SetGroupAddRequest from './group/SetGroupAddRequest';
import SetGroupLeave from './group/SetGroupLeave';
import GetGuildList from './guild/GetGuildList';
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
import { GetGroupIgnoredNotifies } from './group/GetGroupIgnoredNotifies';
import { GetOnlineClient } from './go-cqhttp/GetOnlineClient';
import { IOCRImage, OCRImage } from './extends/OCRImage';
import { TranslateEnWordToZn } from './extends/TranslateEnWordToZn';
import { SetQQProfile } from './go-cqhttp/SetQQProfile';
import { ShareGroupEx, SharePeer } from './extends/ShareContact';
import { CreateCollection } from './extends/CreateCollection';
import { SetLongNick } from './extends/SetLongNick';
import DelEssenceMsg from './group/DelEssenceMsg';
import SetEssenceMsg from './group/SetEssenceMsg';
import GetRecentContact from './user/GetRecentContact';
import { GetProfileLike } from './extends/GetProfileLike';
import SetGroupPortrait from './go-cqhttp/SetGroupPortrait';
import { FetchCustomFace } from './extends/FetchCustomFace';
import GoCQHTTPUploadPrivateFile from './go-cqhttp/UploadPrivateFile';
import { FetchEmojiLike } from './extends/FetchEmojiLike';
import { NapCatCore } from '@/core';

import { NapCatOneBot11Adapter } from '@/onebot';
import GetGuildProfile from './guild/GetGuildProfile';
import SetModelShow from './go-cqhttp/SetModelShow';
import { SetInputStatus } from './extends/SetInputStatus';
import { GetCSRF } from './system/GetCSRF';
import { DelGroupNotice } from './group/DelGroupNotice';
import { GetGroupInfoEx } from './extends/GetGroupInfoEx';
import { DeleteGroupFile } from '@/onebot/action/go-cqhttp/DeleteGroupFile';
import { CreateGroupFileFolder } from '@/onebot/action/go-cqhttp/CreateGroupFileFolder';
import { DeleteGroupFileFolder } from '@/onebot/action/go-cqhttp/DeleteGroupFileFolder';
import { GetGroupFileSystemInfo } from '@/onebot/action/go-cqhttp/GetGroupFileSystemInfo';
import { GetGroupRootFiles } from '@/onebot/action/go-cqhttp/GetGroupRootFiles';
import { GetGroupFilesByFolder } from '@/onebot/action/go-cqhttp/GetGroupFilesByFolder';

export type ActionMap = Map<string, BaseAction<any, any>>;

export function createActionMap(obContext: NapCatOneBot11Adapter, core: NapCatCore): ActionMap {

    const actionHandlers = [
        new GetGroupInfoEx(obContext, core),
        new FetchEmojiLike(obContext, core),
        new GetFile(obContext, core),
        new SetQQProfile(obContext, core),
        new ShareGroupEx(obContext, core),
        new SharePeer(obContext, core),
        new CreateCollection(obContext, core),
        new SetLongNick(obContext, core),
        new ForwardFriendSingleMsg(obContext, core),
        new ForwardGroupSingleMsg(obContext, core),
        new MarkGroupMsgAsRead(obContext, core),
        new MarkPrivateMsgAsRead(obContext, core),
        new SetQQAvatar(obContext, core),
        new TranslateEnWordToZn(obContext, core),
        new GetGroupRootFiles(obContext, core),
        // onebot11
        new SendLike(obContext, core),
        new GetMsg(obContext, core),
        new GetLoginInfo(obContext, core),
        new GetFriendList(obContext, core),
        new GetGroupList(obContext, core),
        new GetGroupInfo(obContext, core),
        new GetGroupMemberList(obContext, core),
        new GetGroupMemberInfo(obContext, core),
        new SendGroupMsg(obContext, core),
        new SendPrivateMsg(obContext, core),
        new SendMsg(obContext, core),
        new DeleteMsg(obContext, core),
        new SetGroupAddRequest(obContext, core),
        new SetFriendAddRequest(obContext, core),
        new SetGroupLeave(obContext, core),
        new GetVersionInfo(obContext, core),
        new CanSendRecord(obContext, core),
        new CanSendImage(obContext, core),
        new GetStatus(obContext, core),
        new SetGroupWholeBan(obContext, core),
        new SetGroupBan(obContext, core),
        new SetGroupKick(obContext, core),
        new SetGroupAdmin(obContext, core),
        new SetGroupName(obContext, core),
        new SetGroupCard(obContext, core),
        new GetImage(obContext, core),
        new GetRecord(obContext, core),
        new SetMsgEmojiLike(obContext, core),
        new GetCookies(obContext, core),
        new SetOnlineStatus(obContext, core),
        new GetRobotUinRange(obContext, core),
        new GetFriendWithCategory(obContext, core),
        //以下为go-cqhttp api
        new GetOnlineClient(obContext, core),
        new OCRImage(obContext, core),
        new IOCRImage(obContext, core),
        new GetGroupHonorInfo(obContext, core),
        new SendGroupNotice(obContext, core),
        new GetGroupNotice(obContext, core),
        new GetGroupEssence(obContext, core),
        new GoCQHTTPSendForwardMsg(obContext, core),
        new GoCQHTTPSendGroupForwardMsg(obContext, core),
        new GoCQHTTPSendPrivateForwardMsg(obContext, core),
        new GoCQHTTPGetStrangerInfo(obContext, core),
        new GoCQHTTPDownloadFile(obContext, core),
        new GetGuildList(obContext, core),
        new GoCQHTTPMarkMsgAsRead(obContext, core),
        new GoCQHTTPUploadGroupFile(obContext, core),
        new GoCQHTTPGetGroupMsgHistory(obContext, core),
        new GoCQHTTPGetForwardMsgAction(obContext, core),
        new GetFriendMsgHistory(obContext, core),
        new GoCQHTTPHandleQuickAction(obContext, core),
        new GetGroupIgnoredNotifies(obContext, core),
        new DelEssenceMsg(obContext, core),
        new SetEssenceMsg(obContext, core),
        new GetRecentContact(obContext, core),
        new MarkAllMsgAsRead(obContext, core),
        new GetProfileLike(obContext, core),
        new SetGroupPortrait(obContext, core),
        new FetchCustomFace(obContext, core),
        new GoCQHTTPUploadPrivateFile(obContext, core),
        new GetGuildProfile(obContext, core),
        new SetModelShow(obContext, core),
        new SetInputStatus(obContext, core),
        new GetCSRF(obContext, core),
        new DelGroupNotice(obContext, core),
        new DeleteGroupFile(obContext, core),
        new CreateGroupFileFolder(obContext, core),
        new DeleteGroupFileFolder(obContext, core),
        new GetGroupFileSystemInfo(obContext, core),
        new GetGroupFilesByFolder(obContext, core),
    ];
    const actionMap = new Map();
    for (const action of actionHandlers) {
        actionMap.set(action.actionName, action);
        actionMap.set(action.actionName + '_async', action);
        actionMap.set(action.actionName + '_rate_limited', action);
    }

    return actionMap;
}
