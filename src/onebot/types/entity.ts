export interface OB11User {
  user_id: number;
  nickname: string;
  remark?: string;
  sex?: OB11UserSex;
  level?: number;
  age?: number;
  qid?: string;
  login_days?: number;
  categroyName?:string;
  categoryId?:number;
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
  group_id: number
  user_id: number
  nickname: string
  card?: string
  sex?: OB11UserSex
  age?: number
  join_time?: number
  last_sent_time?: number
  level?: string
  qq_level?: number
  role?: OB11GroupMemberRole
  title?: string
  area?: string
  unfriendly?: boolean
  title_expire_time?: number
  card_changeable?: boolean
  // 以下为gocq字段
  shut_up_timestamp?: number
  // 以下为扩展字段
  is_robot?: boolean
  qage?: number
}

export interface OB11Group {
  group_id: number
  group_name: string
  member_count?: number
  max_member_count?: number
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
