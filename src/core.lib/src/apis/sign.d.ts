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
export interface MiniAppLuaJsonType {
    prompt: string;
    title: string;
    preview: string;
    jumpUrl: string;
    tag: string;
    tagIcon: string;
    source: string;
    sourcelogo: string;
}
export declare function SignMiniApp(CardData: MiniAppLuaJsonType): Promise<string>;
export declare function SignMusicInternal(songname: string, singer: string, songmid: string, songmusic: string): Promise<{
    code: number;
    data: {
        signed_ark: string;
    };
}>;
export declare function CreateMusicThridWay0(id?: string, mid?: string): Promise<{
    mid: string;
    name?: string | undefined;
    singer?: string | undefined;
    url?: string | undefined;
    cover?: string | undefined;
}>;
