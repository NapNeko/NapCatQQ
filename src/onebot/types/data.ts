export interface OB11User {
    birthday_year?: number; // 生日
    birthday_month?: number; // 生日
    birthday_day?: number; // 生日
    phone_num?: string; // 手机号
    email?: string; // 邮箱
    category_id?: number; // 分组ID
    user_id: number; // 用户ID
    nickname: string; // 昵称
    remark?: string; // 备注
    sex?: OB11UserSex; // 性别
    level?: number; // 等级
    age?: number; // 年龄
    qid?: string; // QID
    login_days?: number; // 登录天数
    categoryName?: string; // 分组名称
    categoryId?: number; // 分组ID 999为特别关心
}
export interface Notify {
    request_id: number;
    invitor_uin: number;
    invitor_nick?: string;
    group_id?: number;
    group_name?: string;
    message?: string;
    checked: boolean;
    actor: number;
    requester_nick?: string;
}

export enum OB11UserSex {
    male = 'male', // 男性
    female = 'female', // 女性
    unknown = 'unknown' // 未知
}

export enum OB11GroupMemberRole {
    owner = 'owner', // 群主
    admin = 'admin', // 管理员
    member = 'member', // 成员
}

export interface OB11GroupMember {
    group_id: number; // 群ID
    user_id: number; // 用户ID
    nickname: string; // 昵称
    card?: string; // 群名片
    sex?: OB11UserSex; // 性别
    age?: number; // 年龄
    join_time?: number; // 加入时间
    last_sent_time?: number; // 最后发言时间
    level?: string; // 群等级
    qq_level?: number; // QQ等级
    role?: OB11GroupMemberRole; // 群角色
    title?: string; // 头衔
    area?: string; // 地区
    unfriendly?: boolean; // 是否不友好
    title_expire_time?: number; // 头衔过期时间
    card_changeable?: boolean; // 名片是否可修改
    shut_up_timestamp?: number; // 禁言时间戳
    is_robot?: boolean; // 是否机器人
    qage?: number; // QQ年龄
}

export interface OB11Group {
    group_all_shut: number; // 群全员禁言
    group_remark: string; // 群备注
    group_id: number; // 群ID
    group_name: string; // 群名称
    member_count?: number; // 成员数量
    max_member_count?: number; // 最大成员数量
}

export interface OB11Sender {
    user_id: number; // 用户ID
    nickname: string; // 昵称
    sex?: OB11UserSex; // 性别
    age?: number; // 年龄
    card?: string; // 群名片
    level?: string; // 群等级
    role?: OB11GroupMemberRole; // 群角色
}

export interface OB11GroupFile {
    file_size: number; // 文件大小 GOCQHTTP 群文件Api扩展
    group_id: number; // 群ID
    file_id: string; // 文件ID
    file_name: string; // 文件名称
    busid: number; // 业务ID
    size: number; // 文件大小
    upload_time: number; // 上传时间
    dead_time: number; // 过期时间
    modify_time: number; // 修改时间
    download_times: number; // 下载次数
    uploader: number; // 上传者ID
    uploader_name: string; // 上传者名称
}

export interface OB11GroupFileFolder {
    group_id: number; // 群ID
    folder_id: string; // 文件夹ID
    folder: string; // 文件夹路径
    folder_name: string; // 文件夹名称
    create_time: number; // 创建时间
    creator: number; // 创建者ID
    creator_name: string; // 创建者名称
    total_file_count: number; // 文件总数
}