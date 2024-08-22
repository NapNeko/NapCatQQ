import { calcQQLevel } from '@/common/utils/helper';
import { SelfInfo, FriendV2, Friend, Sex, GroupMember, User, Group } from '@/core';
import { OB11User, OB11GroupMemberRole, OB11UserSex, OB11GroupMember, OB11Group } from '../types';


export class OB11Constructor {
    static selfInfo(selfInfo: SelfInfo): OB11User {
        return {
            user_id: parseInt(selfInfo.uin),
            nickname: selfInfo.nick,
        };
    }

    static friendsV2(friends: FriendV2[]): OB11User[] {
        const data: OB11User[] = [];
        friends.forEach(friend => {
            const sexValue = this.sex(friend.baseInfo.sex!);
            data.push({
                ...friend.baseInfo,
                ...friend.coreInfo,
                user_id: parseInt(friend.coreInfo.uin),
                nickname: friend.coreInfo.nick,
                remark: friend.coreInfo.nick,
                sex: sexValue,
                level: 0,
            });
        });
        return data;
    }

    static friends(friends: Friend[]): OB11User[] {
        const data: OB11User[] = [];
        friends.forEach(friend => {
            const sexValue = this.sex(friend.sex!);
            data.push({
                user_id: parseInt(friend.uin),
                nickname: friend.nick,
                remark: friend.remark,
                sex: sexValue,
                level: 0,
            });
        });
        return data;
    }

    static groupMemberRole(role: number): OB11GroupMemberRole | undefined {
        return {
            4: OB11GroupMemberRole.owner,
            3: OB11GroupMemberRole.admin,
            2: OB11GroupMemberRole.member,
        }[role];
    }

    static sex(sex: Sex): OB11UserSex {
        const sexMap = {
            [Sex.male]: OB11UserSex.male,
            [Sex.female]: OB11UserSex.female,
            [Sex.unknown]: OB11UserSex.unknown,
        };
        return sexMap[sex] || OB11UserSex.unknown;
    }

    static groupMember(group_id: string, member: GroupMember): OB11GroupMember {
        return {
            group_id: parseInt(group_id),
            user_id: parseInt(member.uin),
            nickname: member.nick,
            card: member.cardName,
            sex: OB11Constructor.sex(member.sex!),
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
            role: OB11Constructor.groupMemberRole(member.role),
            title: member.memberSpecialTitle || '',
        };
    }

    static stranger(user: User): OB11User {
        //logDebug('construct ob11 stranger', user);
        return {
            ...user,
            user_id: parseInt(user.uin),
            nickname: user.nick,
            sex: OB11Constructor.sex(user.sex!),
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
        return groups.map(OB11Constructor.group);
    }
}
