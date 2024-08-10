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
import { FetchEmojiLike } from './extends/FetchEmojiLike';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '../main';

export function createActionMap(onebotContext: NapCatOneBot11Adapter, coreContext: NapCatCore) {
    const actionHandlers = [
        new FetchEmojiLike(onebotContext, coreContext),
        new GetFile(onebotContext, coreContext),
        new SetSelfProfile(onebotContext, coreContext),
        new shareGroupEx(onebotContext, coreContext),
        new sharePeer(onebotContext, coreContext),
        new CreateCollection(onebotContext, coreContext),
        new SetLongNick(onebotContext, coreContext),
        new ForwardFriendSingleMsg(onebotContext, coreContext),
        new ForwardGroupSingleMsg(onebotContext, coreContext),
        new MarkGroupMsgAsRead(onebotContext, coreContext),
        new MarkPrivateMsgAsRead(onebotContext, coreContext),
        new SetQQAvatar(onebotContext, coreContext),
        new TranslateEnWordToZn(onebotContext, coreContext),
        new GetGroupFileCount(onebotContext, coreContext),
        new GetGroupFileList(onebotContext, coreContext),
        new SetGroupFileFolder(onebotContext, coreContext),
        new DelGroupFile(onebotContext, coreContext),
        new DelGroupFileFolder(onebotContext, coreContext),
        // onebot11
        new SendLike(onebotContext, coreContext),
        new GetMsg(onebotContext, coreContext),
        new GetLoginInfo(onebotContext, coreContext),
        new GetFriendList(onebotContext, coreContext),
        new GetGroupList(onebotContext, coreContext),
        new GetGroupInfo(onebotContext, coreContext),
        new GetGroupMemberList(onebotContext, coreContext),
        new GetGroupMemberInfo(onebotContext, coreContext),
        new SendGroupMsg(onebotContext, coreContext),
        new SendPrivateMsg(onebotContext, coreContext),
        new SendMsg(onebotContext, coreContext),
        new DeleteMsg(onebotContext, coreContext),
        new SetGroupAddRequest(onebotContext, coreContext),
        new SetFriendAddRequest(onebotContext, coreContext),
        new SetGroupLeave(onebotContext, coreContext),
        new GetVersionInfo(onebotContext, coreContext),
        new CanSendRecord(onebotContext, coreContext),
        new CanSendImage(onebotContext, coreContext),
        new GetStatus(onebotContext, coreContext),
        new SetGroupWholeBan(onebotContext, coreContext),
        new SetGroupBan(onebotContext, coreContext),
        new SetGroupKick(onebotContext, coreContext),
        new SetGroupAdmin(onebotContext, coreContext),
        new SetGroupName(onebotContext, coreContext),
        new SetGroupCard(onebotContext, coreContext),
        new GetImage(onebotContext, coreContext),
        new GetRecord(onebotContext, coreContext),
        new SetMsgEmojiLike(onebotContext, coreContext),
        new GetCookies(onebotContext, coreContext),
        new SetOnlineStatus(onebotContext, coreContext),
        new GetRobotUinRange(onebotContext, coreContext),
        new GetFriendWithCategory(onebotContext, coreContext),
        //以下为go-cqhttp api
        new GetOnlineClient(onebotContext, coreContext),
        new OCRImage(onebotContext, coreContext),
        new IOCRImage(onebotContext, coreContext),
        new GetGroupHonorInfo(onebotContext, coreContext),
        new SendGroupNotice(onebotContext, coreContext),
        new GetGroupNotice(onebotContext, coreContext),
        new GetGroupEssence(onebotContext, coreContext),
        new GoCQHTTPSendForwardMsg(onebotContext, coreContext),
        new GoCQHTTPSendGroupForwardMsg(onebotContext, coreContext),
        new GoCQHTTPSendPrivateForwardMsg(onebotContext, coreContext),
        new GoCQHTTPGetStrangerInfo(onebotContext, coreContext),
        new GoCQHTTPDownloadFile(onebotContext, coreContext),
        new GetGuildList(onebotContext, coreContext),
        new GoCQHTTPMarkMsgAsRead(onebotContext, coreContext),
        new GoCQHTTPUploadGroupFile(onebotContext, coreContext),
        new GoCQHTTPGetGroupMsgHistory(onebotContext, coreContext),
        new GoCQHTTPGetForwardMsgAction(onebotContext, coreContext),
        new GetFriendMsgHistory(onebotContext, coreContext),
        new GoCQHTTPHandleQuickAction(onebotContext, coreContext),
        new GetGroupSystemMsg(onebotContext, coreContext),
        new DelEssenceMsg(onebotContext, coreContext),
        new SetEssenceMsg(onebotContext, coreContext),
        new GetRecentContact(onebotContext, coreContext),
        new MarkAllMsgAsRead(onebotContext, coreContext),
        new GetProfileLike(onebotContext, coreContext),
        new SetGroupHeader(onebotContext, coreContext),
        new FetchCustomFace(onebotContext, coreContext),
        new GoCQHTTPUploadPrivateFile(onebotContext, coreContext),
    ];
    const actionMap = new Map<string, BaseAction<any, any>>();
    for (const action of actionHandlers) {
        actionMap.set(action.actionName, action);
        actionMap.set(action.actionName + '_async', action);
        actionMap.set(action.actionName + '_rate_limited', action);
    }

    return actionMap;
}
