export enum AIVoiceChatType {
    Unknown = 0,
    Sound = 1,
    Sing = 2
}

export interface AIVoiceItem {
    voiceId: string;
    voiceDisplayName: string;
    voiceExampleUrl: string;
}

export interface AIVoiceItemList {
    category: string;
    voices: AIVoiceItem[];
}
