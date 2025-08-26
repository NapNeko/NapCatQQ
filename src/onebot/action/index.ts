import GetMsg from './msg/GetMsg';
import GetLoginInfo from './system/GetLoginInfo';
import GetFriendList from './user/GetFriendList';
import GetGroupList from './group/GetGroupList';
import GetGroupInfo from './group/GetGroupInfo';
import GetGroupMemberInfo from './group/GetGroupMemberInfo';
import SendGroupMsg from './group/SendGroupMsg';
import SendPrivateMsg from './msg/SendPrivateMsg';
import SendMsg from './msg/SendMsg';
import DeleteMsg from './msg/DeleteMsg';
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
import { GetGroupSystemMsg } from './system/GetSystemMsg';
import { GetUserStatus } from './extends/GetUserStatus';
import { GetRkey } from './extends/GetRkey';
import { SetSpecialTitle } from './extends/SetSpecialTitle';
import { GetGroupShutList } from './group/GetGroupShutList';
import { GetGroupMemberList } from './group/GetGroupMemberList';
import { GetGroupFileUrl } from '@/onebot/action/file/GetGroupFileUrl';
import { GetPacketStatus } from '@/onebot/action/packet/GetPacketStatus';
import { GetCredentials } from './system/GetCredentials';
import { SendGroupSign, SetGroupSign } from './extends/SetGroupSign';
import { GoCQHTTPGetGroupAtAllRemain } from './go-cqhttp/GetGroupAtAllRemain';
import { GoCQHTTPCheckUrlSafely } from './go-cqhttp/GoCQHTTPCheckUrlSafely';
import { GoCQHTTPGetModelShow } from './go-cqhttp/GoCQHTTPGetModelShow';
import { GoCQHTTPSetModelShow } from './go-cqhttp/GoCQHTTPSetModelShow';
import { GoCQHTTPDeleteFriend } from './go-cqhttp/GoCQHTTPDeleteFriend';
import { GetMiniAppArk } from '@/onebot/action/extends/GetMiniAppArk';
import { GetAiRecord } from '@/onebot/action/group/GetAiRecord';
import { SendGroupAiRecord } from '@/onebot/action/group/SendGroupAiRecord';
import { GetAiCharacters } from '@/onebot/action/extends/GetAiCharacters';
import { GetGuildList } from './guild/GetGuildList';
import { GetGuildProfile } from './guild/GetGuildProfile';
import { GetClientkey } from './extends/GetClientkey';
import { SendPacket } from './extends/SendPacket';
import { FriendPoke, GroupPoke, SendPoke } from '@/onebot/action/packet/SendPoke';
import { SetDiyOnlineStatus } from './extends/SetDiyOnlineStatus';
import { BotExit } from './extends/BotExit';
import { ClickInlineKeyboardButton } from './extends/ClickInlineKeyboardButton';
import { GetPrivateFileUrl } from './file/GetPrivateFileUrl';
import { GetUnidirectionalFriendList } from './extends/GetUnidirectionalFriendList';
import SetGroupRemark from './extends/SetGroupRemark';
import { MoveGroupFile } from './extends/MoveGroupFile';
import { TransGroupFile } from './extends/TransGroupFile';
import { RenameGroupFile } from './extends/RenameGroupFile';
import { GetRkeyServer } from './packet/GetRkeyServer';
import { GetRkeyEx } from './packet/GetRkeyEx';
import { CleanCache } from './system/CleanCache';
import SetFriendRemark from './user/SetFriendRemark';
import { SetDoubtFriendsAddRequest } from './new/SetDoubtFriendsAddRequest';
import { GetDoubtFriendsAddRequest } from './new/GetDoubtFriendsAddRequest';
import SetGroupAddOption from './extends/SetGroupAddOption';
import SetGroupSearch from './extends/SetGroupSearch';
import SetGroupRobotAddOption from './extends/SetGroupRobotAddOption';
import SetGroupKickMembers from './extends/SetGroupKickMembers';
import { GetGroupDetailInfo } from './group/GetGroupDetailInfo';
import GetGroupAddRequest from './extends/GetGroupAddRequest';
import { GetCollectionList } from './extends/GetCollectionList';
import { SetGroupTodo } from './packet/SetGroupTodo';
import { GetQunAlbumList } from './extends/GetQunAlbumList';
import { UploadImageToQunAlbum } from './extends/UploadImageToQunAlbum';
import { DoGroupAlbumComment } from './extends/DoGroupAlbumComment';
import { GetGroupAlbumMediaList } from './extends/GetGroupAlbumMediaList';
import { SetGroupAlbumMediaLike } from './extends/SetGroupAlbumMediaLike';
import { DelGroupAlbumMedia } from './extends/DelGroupAlbumMedia';

export function createActionMap(obContext: NapCatOneBot11Adapter, core: NapCatCore) {

    const actionHandlers = [
        new DelGroupAlbumMedia(obContext, core),
        new SetGroupAlbumMediaLike(obContext, core),
        new DoGroupAlbumComment(obContext, core),
        new GetGroupAlbumMediaList(obContext, core),
        new GetQunAlbumList(obContext, core),
        new UploadImageToQunAlbum(obContext, core),
        new SetGroupTodo(obContext, core),
        new GetGroupDetailInfo(obContext, core),
        new SetGroupKickMembers(obContext, core),
        new SetGroupAddOption(obContext, core),
        new SetGroupRobotAddOption(obContext, core),
        new SetGroupSearch(obContext, core),
        new SetDoubtFriendsAddRequest(obContext, core),
        new GetDoubtFriendsAddRequest(obContext, core),
        new SetFriendRemark(obContext, core),
        new GetRkeyEx(obContext, core),
        new GetRkeyServer(obContext, core),
        new SetGroupRemark(obContext, core),
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
        new SetGroupSign(obContext, core),
        new SendGroupSign(obContext, core),
        new GetClientkey(obContext, core),
        new MoveGroupFile(obContext, core),
        new RenameGroupFile(obContext, core),
        new TransGroupFile(obContext, core),
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
        new GoCQHTTPDeleteFriend(obContext, core),
        new GoCQHTTPCheckUrlSafely(obContext, core),
        new GetOnlineClient(obContext, core),
        new OCRImage(obContext, core),
        new IOCRImage(obContext, core),
        new GetGroupHonorInfo(obContext, core),
        new SendGroupNotice(obContext, core),
        new GetGroupNotice(obContext, core),
        new GetGroupEssence(obContext, core),
        new GoCQHTTPGetGroupAtAllRemain(obContext, core),
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
        new GoCQHTTPGetModelShow(obContext, core),
        new GoCQHTTPSetModelShow(obContext, core),
        new GoCQHTTPCheckUrlSafely(obContext, core),
        new SetInputStatus(obContext, core),
        new GetCSRF(obContext, core),
        new GetCredentials(obContext, core),
        new DelGroupNotice(obContext, core),
        new DeleteGroupFile(obContext, core),
        new CreateGroupFileFolder(obContext, core),
        new DeleteGroupFileFolder(obContext, core),
        new GetGroupFileSystemInfo(obContext, core),
        new GetGroupFilesByFolder(obContext, core),
        new GetPacketStatus(obContext, core),
        new GroupPoke(obContext, core),
        new FriendPoke(obContext, core),
        new GetUserStatus(obContext, core),
        new GetRkey(obContext, core),
        new SetSpecialTitle(obContext, core),
        new SetDiyOnlineStatus(obContext, core),
        // new UploadForwardMsg(obContext, core),
        new GetGroupShutList(obContext, core),
        new GetGroupFileUrl(obContext, core),
        new GetMiniAppArk(obContext, core),
        new GetAiRecord(obContext, core),
        new SendGroupAiRecord(obContext, core),
        new GetAiCharacters(obContext, core),
        new SendPacket(obContext, core),
        new SendPoke(obContext, core),
        new GetGroupSystemMsg(obContext, core),
        new BotExit(obContext, core),
        new ClickInlineKeyboardButton(obContext, core),
        new GetPrivateFileUrl(obContext, core),
        new GetUnidirectionalFriendList(obContext, core),
        new CleanCache(obContext, core),
        new GetGroupAddRequest(obContext, core),
        new GetCollectionList(obContext, core),
    ];

    type HandlerUnion = typeof actionHandlers[number];
    type MapType = {
        [H in HandlerUnion as H['actionName']]: H;
    } & {
        [H in HandlerUnion as `${H['actionName']}_async`]: H;
    } & {
        [H in HandlerUnion as `${H['actionName']}_rate_limited`]: H;
    };

    const _map = new Map<keyof MapType, HandlerUnion>();

    actionHandlers.forEach(h => {
        _map.set(h.actionName as keyof MapType, h);
        _map.set(`${h.actionName}_async` as keyof MapType, h);
        _map.set(`${h.actionName}_rate_limited` as keyof MapType, h);
    });

    // function get<K extends keyof MapType>(key: K): MapType[K];
    // function get<K extends keyof MapType>(key: K): null;
    // function get<K extends keyof MapType>(key: K): HandlerUnion | null | MapType[K]
    function get<K extends keyof MapType>(key: K): MapType[K] | undefined {
        return _map.get(key as keyof MapType) as MapType[K] | undefined;
    }

    return { get };
}
export type ActionMap = ReturnType<typeof createActionMap>
