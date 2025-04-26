import { calcQQLevel } from '@/common/helper';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { FriendV2, Group, GroupFileInfoUpdateParamType, GroupMember, SelfInfo, NTSex } from '@/core';
import {
    OB11Group,
    OB11GroupFile,
    OB11GroupFileFolder,
    OB11GroupMember,
    OB11GroupMemberRole,
    OB11User,
    OB11UserSex,
} from '@/onebot/types';
export class OB11Construct {
    static selfInfo(selfInfo: SelfInfo): OB11User {
        return {
            user_id: +selfInfo.uin,
            nickname: selfInfo.nick,
        };
    }

    static friends(friends: FriendV2[]): OB11User[] {
        return friends.map(rawFriend => ({
            birthday_year: rawFriend.baseInfo.birthday_year,
            birthday_month: rawFriend.baseInfo.birthday_month,
            birthday_day: rawFriend.baseInfo.birthday_day,
            user_id: parseInt(rawFriend.coreInfo.uin),
            age: rawFriend.baseInfo.age,
            phone_num: rawFriend.baseInfo.phoneNum,
            email: rawFriend.baseInfo.eMail,
            category_id: rawFriend.baseInfo.categoryId,
            nickname: rawFriend.coreInfo.nick ?? '',
            remark: rawFriend.coreInfo.remark ?? rawFriend.coreInfo.nick,
            sex: this.sex(rawFriend.baseInfo.sex),
            level: rawFriend.qqLevel && calcQQLevel(rawFriend.qqLevel) || 0,
        }));
    }
    static friend(friends: FriendV2): OB11User {
        return {
            birthday_year: friends.baseInfo.birthday_year,
            birthday_month: friends.baseInfo.birthday_month,
            birthday_day: friends.baseInfo.birthday_day,
            user_id: parseInt(friends.coreInfo.uin),
            age: friends.baseInfo.age,
            phone_num: friends.baseInfo.phoneNum,
            email: friends.baseInfo.eMail,
            category_id: friends.baseInfo.categoryId,
            nickname: friends.coreInfo.nick ?? '',
            remark: friends.coreInfo.remark ?? friends.coreInfo.nick,
            sex: this.sex(friends.baseInfo.sex),
            level: 0,
        };
    }
    static groupMemberRole(role: number): OB11GroupMemberRole | undefined {
        return {
            4: OB11GroupMemberRole.owner,
            3: OB11GroupMemberRole.admin,
            2: OB11GroupMemberRole.member,
        }[role];
    }

    static sex(sex?: NTSex): OB11UserSex {
        if (!sex) return OB11UserSex.unknown;
        return {
            [NTSex.GENDER_MALE]: OB11UserSex.male,
            [NTSex.GENDER_FEMALE]: OB11UserSex.female,
            [NTSex.GENDER_UNKOWN]: OB11UserSex.unknown,
            [NTSex.GENDER_PRIVACY]: OB11UserSex.unknown,
        }[sex] || OB11UserSex.unknown;
    }

    static groupMember(group_id: string, member: GroupMember): OB11GroupMember {
        return {
            group_id: +group_id,
            user_id: +member.uin,
            nickname: member.nick,
            card: member.cardName,
            sex: this.sex(member.sex),
            age: member.age ?? 0,
            area: '',
            level: member.memberRealLevel?.toString() ?? '0',
            qq_level: member.qqLevel && calcQQLevel(member.qqLevel) || 0,
            join_time: +member.joinTime,
            last_sent_time: +member.lastSpeakTime,
            title_expire_time: 0,
            unfriendly: false,
            card_changeable: true,
            is_robot: member.isRobot,
            shut_up_timestamp: member.shutUpTime,
            role: this.groupMemberRole(member.role),
            title: member.memberSpecialTitle ?? '',
        };
    }

    static group(group: Group): OB11Group {
        return {
            group_all_shut: (+group.groupShutupExpireTime > 0 )? -1 : 0,
            group_remark: group.remarkName,
            group_id: +group.groupCode,
            group_name: group.groupName,
            member_count: group.memberCount,
            max_member_count: group.maxMember,
        };
    }

    static groups(groups: Group[]): OB11Group[] {
        return groups.map(this.group);
    }

    static file(peerId: string, file: Exclude<GroupFileInfoUpdateParamType['item'][0]['fileInfo'], undefined>): OB11GroupFile {
        return {
            group_id: +peerId,
            file_id: FileNapCatOneBotUUID.encodeModelId({ chatType: 2, peerUid: peerId }, file.fileModelId, file.fileId, file.fileId ?? ''),
            file_name: file.fileName,
            busid: file.busId,
            size: +file.fileSize,
            file_size: +file.fileSize,
            upload_time: file.uploadTime,
            dead_time: file.deadTime,
            modify_time: file.modifyTime,
            download_times: file.downloadTimes,
            uploader: +file.uploaderUin,
            uploader_name: file.uploaderName,
        };
    }

    static folder(peerId: string, folder: Exclude<GroupFileInfoUpdateParamType['item'][0]['folderInfo'], undefined>): OB11GroupFileFolder {
        return {
            group_id: +peerId,
            folder_id: folder.folderId,
            folder: folder.folderId,
            folder_name: folder.folderName,
            create_time: folder.createTime,
            creator: +folder.createUin,
            creator_name: folder.creatorName,
            total_file_count: folder.totalFileCount,
        };
    }
}