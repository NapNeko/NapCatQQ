import { calcQQLevel, FileNapCatOneBotUUID } from '@/common/helper';
import { Friend, FriendV2, Group, GroupFileInfoUpdateParamType, GroupMember, SelfInfo, Sex, User } from '@/core';
import {
    OB11Group,
    OB11GroupFile,
    OB11GroupFileFolder,
    OB11GroupMember,
    OB11GroupMemberRole,
    OB11User,
    OB11UserSex,
} from './types';

export class OB11Entities {
    static selfInfo(selfInfo: SelfInfo): OB11User {
        return {
            user_id: parseInt(selfInfo.uin),
            nickname: selfInfo.nick,
        };
    }

    static friendsV2(friends: FriendV2[]): OB11User[] {
        return friends.map(rawFriend => ({
            ...rawFriend.baseInfo,
            ...rawFriend.coreInfo,
            user_id: parseInt(rawFriend.coreInfo.uin),
            nickname: rawFriend.coreInfo.nick,
            remark: rawFriend.coreInfo.remark ?? rawFriend.coreInfo.nick,
            sex: this.sex(rawFriend.baseInfo.sex!),
            level: 0,
        }));
    }

    static friends(friends: Friend[]): OB11User[] {
        return friends.map(rawFriend => ({
            user_id: parseInt(rawFriend.uin),
            nickname: rawFriend.nick,
            remark: rawFriend.remark,
            sex: this.sex(rawFriend.sex!),
            level: 0,
        }));
    }

    static groupMemberRole(role: number): OB11GroupMemberRole | undefined {
        return {
            4: OB11GroupMemberRole.owner,
            3: OB11GroupMemberRole.admin,
            2: OB11GroupMemberRole.member,
        }[role];
    }

    static sex(sex: Sex): OB11UserSex {
        return {
            [Sex.male]: OB11UserSex.male,
            [Sex.female]: OB11UserSex.female,
            [Sex.unknown]: OB11UserSex.unknown,
        }[sex] || OB11UserSex.unknown;
    }

    static groupMember(group_id: string, member: GroupMember): OB11GroupMember {
        return {
            group_id: parseInt(group_id),
            user_id: parseInt(member.uin),
            nickname: member.nick,
            card: member.cardName,
            sex: OB11Entities.sex(member.sex!),
            age: member.age ?? 0,
            area: '',
            level: '0',
            qq_level: member.qqLevel && calcQQLevel(member.qqLevel) || 0,
            join_time: 0, // 暂时没法获取
            last_sent_time: 0, // 暂时没法获取
            title_expire_time: 0,
            unfriendly: false,
            card_changeable: true,
            is_robot: member.isRobot,
            shut_up_timestamp: member.shutUpTime,
            role: OB11Entities.groupMemberRole(member.role),
            title: member.memberSpecialTitle || '',
        };
    }

    static stranger(user: User): OB11User {
        return {
            ...user,
            user_id: parseInt(user.uin),
            nickname: user.nick,
            sex: OB11Entities.sex(user.sex!),
            age: 0,
            qid: user.qid,
            login_days: 0,
            level: user.qqLevel && calcQQLevel(user.qqLevel) || 0,
        };
    }


    static group(group: Group): OB11Group {
        return {
            group_id: parseInt(group.groupCode),
            group_name: group.groupName,
            member_count: group.memberCount,
            max_member_count: group.maxMember,
        };
    }

    static groups(groups: Group[]): OB11Group[] {
        return groups.map(OB11Entities.group);
    }

    static file(peerId: string, file: Exclude<GroupFileInfoUpdateParamType['item'][0]['fileInfo'], undefined>): OB11GroupFile {
        return {
            group_id: parseInt(peerId),
            file_id: FileNapCatOneBotUUID.encodeModelId({ chatType: 2, peerUid: peerId }, file.fileModelId, file.fileId),
            file_name: file.fileName,
            busid: file.busId,
            size: parseInt(file.fileSize),
            upload_time: file.uploadTime,
            dead_time: file.deadTime,
            modify_time: file.modifyTime,
            download_times: file.downloadTimes,
            uploader: parseInt(file.uploaderUin),
            uploader_name: file.uploaderName,
        };
    }

    static folder(peerId: string, folder: Exclude<GroupFileInfoUpdateParamType['item'][0]['folderInfo'], undefined>): OB11GroupFileFolder {
        return {
            group_id: parseInt(peerId),
            folder_id: folder.folderId,
            folder_name: folder.folderName,
            create_time: folder.createTime,
            creator: parseInt(folder.createUin),
            creator_name: folder.creatorName,
            total_file_count: folder.totalFileCount,
        };
    }
}
