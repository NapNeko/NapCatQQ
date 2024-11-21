export interface IdMusicSignPostData {
    type: 'qq' | '163' | 'kugou' | 'migu' | 'kuwo',
    id: string | number,
}

export interface CustomMusicSignPostData {
    type: 'qq' | '163' | 'kugou' | 'migu' | 'kuwo' | 'custom',
    id: undefined,
    url: string,
    audio?: string,
    title?: string,
    image: string,
    singer?: string
}

export interface MiniAppLuaJsonType {
    prompt: string,
    title: string,
    preview: string,
    jumpUrl: string,
    tag: string,
    tagIcon: string,
    source: string,
    sourcelogo: string,
}
