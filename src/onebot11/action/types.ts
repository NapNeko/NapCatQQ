export type BaseCheckResult = ValidCheckResult | InvalidCheckResult

export interface ValidCheckResult {
    valid: true

    [k: string | number]: any
}

export interface InvalidCheckResult {
    valid: false
    message: string

    [k: string | number]: any
}

export enum ActionName {
    // 以下为扩展napcat扩展
    SharePeer = 'ArkShareGroup',
    ShareGroupEx = 'ArkSharePeer',
    RebootNormal = 'reboot_normal',//无快速登录重新启动
    GetRobotUinRange = 'get_robot_uin_range',
    SetOnlineStatus = 'set_online_status',
    GetFriendsWithCategory = 'get_friends_with_category',
    GetGroupIgnoreAddRequest = 'get_group_ignore_add_request',
    SetQQAvatar = 'set_qq_avatar',
    GetConfig = 'get_config',
    SetConfig = 'set_config',
    Debug = 'debug',
    GetFile = 'get_file',
    ForwardFriendSingleMsg = 'forward_friend_single_msg',
    ForwardGroupSingleMsg = 'forward_group_single_msg',
    TranslateEnWordToZn = 'translate_en2zh',
    GetGroupFileCount = 'get_group_file_count',
    GetGroupFileList = 'get_group_file_list',
    SetGroupFileFolder = 'set_group_file_folder',
    DelGroupFile = 'del_group_file',
    DelGroupFileFolder = 'del_group_file_folder',
    // onebot 11
    Reboot = 'set_restart',
    SendLike = 'send_like',
    GetLoginInfo = 'get_login_info',
    GetFriendList = 'get_friend_list',
    GetGroupInfo = 'get_group_info',
    GetGroupList = 'get_group_list',
    GetGroupMemberInfo = 'get_group_member_info',
    GetGroupMemberList = 'get_group_member_list',
    GetMsg = 'get_msg',
    SendMsg = 'send_msg',
    SendGroupMsg = 'send_group_msg',
    SendPrivateMsg = 'send_private_msg',
    DeleteMsg = 'delete_msg',
    SetMsgEmojiLike = 'set_msg_emoji_like',
    SetGroupAddRequest = 'set_group_add_request',
    SetFriendAddRequest = 'set_friend_add_request',
    SetGroupLeave = 'set_group_leave',
    GetVersionInfo = 'get_version_info',
    GetStatus = 'get_status',
    CanSendRecord = 'can_send_record',
    CanSendImage = 'can_send_image',
    SetGroupKick = 'set_group_kick',
    SetGroupBan = 'set_group_ban',
    SetGroupWholeBan = 'set_group_whole_ban',
    SetGroupAdmin = 'set_group_admin',
    SetGroupCard = 'set_group_card',
    SetGroupName = 'set_group_name',
    GetImage = 'get_image',
    GetRecord = 'get_record',
    CleanCache = 'clean_cache',
    GetCookies = 'get_cookies',
    // 以下为go-cqhttp api 
    GoCQHTTP_HandleQuickAction = '.handle_quick_operation',
    GetGroupHonorInfo = 'get_group_honor_info',
    GoCQHTTP_GetEssenceMsg = 'get_essence_msg_list',
    GoCQHTTP_SendGroupNotice = '_send_group_notice',
    GoCQHTTP_GetGroupNotice = '_get_group_notice',
    GoCQHTTP_SendForwardMsg = 'send_forward_msg',
    GoCQHTTP_SendGroupForwardMsg = 'send_group_forward_msg',
    GoCQHTTP_SendPrivateForwardMsg = 'send_private_forward_msg',
    GoCQHTTP_GetStrangerInfo = 'get_stranger_info',
    GoCQHTTP_MarkMsgAsRead = 'mark_msg_as_read',
    GetGuildList = 'get_guild_list',
    MarkPrivateMsgAsRead = 'mark_private_msg_as_read',
    MarkGroupMsgAsRead = 'mark_group_msg_as_read',
    GoCQHTTP_UploadGroupFile = 'upload_group_file',
    GoCQHTTP_DownloadFile = 'download_file',
    GoCQHTTP_GetGroupMsgHistory = 'get_group_msg_history',
    GoCQHTTP_GetForwardMsg = 'get_forward_msg',
    GetFriendMsgHistory = 'get_friend_msg_history',
    GetGroupSystemMsg = 'get_group_system_msg',
    GetOnlineClient = 'get_online_clients',
    OCRImage = 'ocr_image',
    IOCRImage = '.ocr_image',
    SetSelfProfile = "set_self_profile",
    CreateCollection = "create_collection"
}
