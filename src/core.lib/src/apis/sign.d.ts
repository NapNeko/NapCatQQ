export interface IdMusicSignPostData {
    type: 'qq' | '163';
    id: string | number;
}
export interface CustomMusicSignPostData {
    type: 'custom';
    url: string;
    audio: string;
    title: string;
    image?: string;
    singer?: string;
}
export declare class MusicSign {
    private readonly url;
    constructor(url: string);
    sign(postData: CustomMusicSignPostData | IdMusicSignPostData): Promise<any>;
}
