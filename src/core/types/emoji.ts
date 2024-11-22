export enum PullMomentType {
    REINSTALL = 0,
    RESTART_FIRST_AIO = 1,
    LOGIN_APP = 2,
    SINGEL_PULL_NOTIFY = 3,
    TRIGGER_SPECIFIC_EMOJI_RANDOM_RESULT = 4
}

export interface PullSysEmojisReq {
    fetchAdvaceSource: boolean;
    fetchBaseSource: boolean;
    pullMoment: PullMomentType;
    pullType: number;
    refresh: boolean;
    thresholdValue: number;
}

export enum BaseEmojiType {
    NORMAL_EMOJI = 0,
    SUPER_EMOJI = 1,
    RANDOM_SUPER_EMOJI = 2,
    CHAIN_SUPER_EMOJI = 3,
    EMOJI_EMOJI = 4
}

export interface GetBaseEmojiPathReq {
    emojiId: string;
    type: BaseEmojiType;
}
export enum EmojiPanelCategory {
    OTHER_PANEL = 0,
    NORMAL_PANEL = 1,
    SUPER_PANEL = 2,
    RED_HEART_PANEL = 3
}

export interface DownloadBaseEmojiInfo {
    baseResDownloadUrl: string;
    advancedResDownloadUrl: string;
}

export interface DownloadBaseEmojiByUrlReq {
    emojiId: string;
    groupName: string;
    panelCategory: EmojiPanelCategory;
    downloadInfo: DownloadBaseEmojiInfo;
}

export interface DownloadBaseEmojiByIdReq {
    emojiId: string;
    groupName: string;
    panelCategory: EmojiPanelCategory;
    qzoneCode: string;
}
