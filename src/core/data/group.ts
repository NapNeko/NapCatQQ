import { GroupDetailInfoV2Param, GroupExtInfo, GroupExtFilter } from "../types";

export function createGroupDetailInfoV2Param(group_code: string): GroupDetailInfoV2Param {
    return {
        groupCode: group_code,
        filter:
        {
            noCodeFingerOpenFlag: 0,
            noFingerOpenFlag: 0,
            groupName: 0,
            classExt: 0,
            classText: 0,
            fingerMemo: 0,
            richFingerMemo: 0,
            tagRecord: 0,
            groupGeoInfo:
            {
                ownerUid: 0,
                setTime: 0,
                cityId: 0,
                longitude: 0,
                latitude: 0,
                geoContent: 0,
                poiId: 0
            },
            groupExtAdminNum: 0,
            flag: 0,
            groupMemo: 0,
            groupAioSkinUrl: 0,
            groupBoardSkinUrl: 0,
            groupCoverSkinUrl: 0,
            groupGrade: 0,
            activeMemberNum: 0,
            certificationType: 0,
            certificationText: 0,
            groupNewGuideLines:
            {
                enabled: 0,
                content: 0
            },
            groupFace: 0,
            addOption: 0,
            shutUpTime: 0,
            groupTypeFlag: 0,
            appPrivilegeFlag: 0,
            appPrivilegeMask: 0,
            groupExtOnly:
            {
                tribeId: 0,
                moneyForAddGroup: 0
            }, groupSecLevel: 0,
            groupSecLevelInfo: 0,
            subscriptionUin: 0,
            subscriptionUid: "",
            allowMemberInvite: 0,
            groupQuestion: 0,
            groupAnswer: 0,
            groupFlagExt3: 0,
            groupFlagExt3Mask: 0,
            groupOpenAppid: 0,
            rootId: 0,
            msgLimitFrequency: 0,
            hlGuildAppid: 0,
            hlGuildSubType: 0,
            hlGuildOrgId: 0,
            groupFlagExt4: 0,
            groupFlagExt4Mask: 0,
            groupSchoolInfo: {
                location: 0,
                grade: 0,
                school: 0
            },
            groupCardPrefix:
            {
                introduction: 0,
                rptPrefix: 0
            }, allianceId: 0,
            groupFlagPro1: 0,
            groupFlagPro1Mask: 0
        },
        modifyInfo: {
            noCodeFingerOpenFlag: 0,
            noFingerOpenFlag: 0,
            groupName: "",
            classExt: 0,
            classText: "",
            fingerMemo: "",
            richFingerMemo: "",
            tagRecord: [],
            groupGeoInfo: {
                ownerUid: "",
                SetTime: 0,
                CityId: 0,
                Longitude: "",
                Latitude: "",
                GeoContent: "",
                poiId: ""
            },
            groupExtAdminNum: 0,
            flag: 0,
            groupMemo: "",
            groupAioSkinUrl: "",
            groupBoardSkinUrl: "",
            groupCoverSkinUrl: "",
            groupGrade: 0,
            activeMemberNum: 0,
            certificationType: 0,
            certificationText: "",
            groupNewGuideLines: {
                enabled: false,
                content: ""
            }, groupFace: 0,
            addOption: 0,
            shutUpTime: 0,
            groupTypeFlag: 0,
            appPrivilegeFlag: 0,
            appPrivilegeMask: 0,
            groupExtOnly: {
                tribeId: 0,
                moneyForAddGroup: 0
            },
            groupSecLevel: 0,
            groupSecLevelInfo: 0,
            subscriptionUin: "",
            subscriptionUid: "",
            allowMemberInvite: 0,
            groupQuestion: "",
            groupAnswer: "",
            groupFlagExt3: 0,
            groupFlagExt3Mask: 0,
            groupOpenAppid: 0,
            rootId: "",
            msgLimitFrequency: 0,
            hlGuildAppid: 0,
            hlGuildSubType: 0,
            hlGuildOrgId: 0,
            groupFlagExt4: 0,
            groupFlagExt4Mask: 0,
            groupSchoolInfo: {
                location: "",
                grade: 0,
                school: ""
            },
            groupCardPrefix:
            {
                introduction: "",
                rptPrefix: []
            },
            allianceId: "",
            groupFlagPro1: 0,
            groupFlagPro1Mask: 0
        }
    }
}
export function createGroupExtInfo(group_code: string): GroupExtInfo {
    return {
        groupCode: group_code,
        resultCode: 0,
        extInfo: {
            groupInfoExtSeq: 0,
            reserve: 0,
            luckyWordId: '',
            lightCharNum: 0,
            luckyWord: '',
            starId: 0,
            essentialMsgSwitch: 0,
            todoSeq: 0,
            blacklistExpireTime: 0,
            isLimitGroupRtc: 0,
            companyId: 0,
            hasGroupCustomPortrait: 0,
            bindGuildId: '',
            groupOwnerId: {
                memberUin: '',
                memberUid: '',
                memberQid: '',
            },
            essentialMsgPrivilege: 0,
            msgEventSeq: '',
            inviteRobotSwitch: 0,
            gangUpId: '',
            qqMusicMedalSwitch: 0,
            showPlayTogetherSwitch: 0,
            groupFlagPro1: '',
            groupBindGuildIds: {
                guildIds: [],
            },
            viewedMsgDisappearTime: '',
            groupExtFlameData: {
                switchState: 0,
                state: 0,
                dayNums: [],
                version: 0,
                updateTime: '',
                isDisplayDayNum: false,
            },
            groupBindGuildSwitch: 0,
            groupAioBindGuildId: '',
            groupExcludeGuildIds: {
                guildIds: [],
            },
            fullGroupExpansionSwitch: 0,
            fullGroupExpansionSeq: '',
            inviteRobotMemberSwitch: 0,
            inviteRobotMemberExamine: 0,
            groupSquareSwitch: 0,
        }
    }
}
export function createGroupExtFilter(): GroupExtFilter {
    return {
        groupInfoExtSeq: 0,
        reserve: 0,
        luckyWordId: 0,
        lightCharNum: 0,
        luckyWord: 0,
        starId: 0,
        essentialMsgSwitch: 0,
        todoSeq: 0,
        blacklistExpireTime: 0,
        isLimitGroupRtc: 0,
        companyId: 0,
        hasGroupCustomPortrait: 0,
        bindGuildId: 0,
        groupOwnerId: 0,
        essentialMsgPrivilege: 0,
        msgEventSeq: 0,
        inviteRobotSwitch: 0,
        gangUpId: 0,
        qqMusicMedalSwitch: 0,
        showPlayTogetherSwitch: 0,
        groupFlagPro1: 0,
        groupBindGuildIds: 0,
        viewedMsgDisappearTime: 0,
        groupExtFlameData: 0,
        groupBindGuildSwitch: 0,
        groupAioBindGuildId: 0,
        groupExcludeGuildIds: 0,
        fullGroupExpansionSwitch: 0,
        fullGroupExpansionSeq: 0,
        inviteRobotMemberSwitch: 0,
        inviteRobotMemberExamine: 0,
        groupSquareSwitch: 0,
    }
};