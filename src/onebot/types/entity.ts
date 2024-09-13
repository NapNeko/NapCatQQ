export interface OB11User {
    [key: string]: any;
    user_id: number;
    nickname: string;
    remark?: string;
    sex?: OB11UserSex;
    level?: number;
    age?: number;
    qid?: string;
    login_days?: number;
    categoryName?: string;
    categoryId?: number;
}

export enum OB11UserSex {
    male = 'male',
    female = 'female',
    unknown = 'unknown'
}

export enum OB11GroupMemberRole {
    owner = 'owner',
    admin = 'admin',
    member = 'member',
}

export interface OB11GroupMember {
    group_id: number;
    user_id: number;
    nickname: string;
    card?: string;
    sex?: OB11UserSex;
    age?: number;
    join_time?: number;
    last_sent_time?: number;
    level?: string;
    qq_level?: number;
    role?: OB11GroupMemberRole;
    title?: string;
    area?: string;
    unfriendly?: boolean;
    title_expire_time?: number;
    card_changeable?: boolean;
    // 以下为gocq字段
    shut_up_timestamp?: number;
    // 以下为扩展字段
    is_robot?: boolean;
    qage?: number;
}

export interface OB11Group {
    group_id: number;
    group_name: string;
    member_count?: number;
    max_member_count?: number;
}

export interface OB11Sender {
    user_id: number,
    nickname: string,
    sex?: OB11UserSex,
    age?: number,
    card?: string,  // 群名片
    level?: string,  // 群等级
    role?: OB11GroupMemberRole
}

export interface OB11GroupFile {
    group_id: number,
    file_id: string,
    file_name: string,
    busid: number,
    size: number,
    upload_time: number,
    dead_time: number,
    modify_time: number,
    download_times: number,
    uploader: number,
    uploader_name: string
}

export interface OB11GroupFileFolder {
    group_id: number,
    folder_id: string,
    folder: string,
    folder_name: string,
    create_time: number,
    creator: number,
    creator_name: string,
    total_file_count: number,
}
