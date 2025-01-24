/** OneBot11消息类型 */
export type OB11SegmentType =
  | 'text'
  | 'face'
  | 'image'
  | 'record'
  | 'video'
  | 'at'
  | 'rps'
  | 'dice'
  | 'shake'
  | 'poke'
  | 'anonymous'
  | 'share'
  | 'contact'
  | 'location'
  | 'music'
  | 'music_custom'
  | 'reply'
  | 'forward'
  | 'node'
  | 'xml'
  | 'json'
  | 'file'

export interface Segment {
  type: OB11SegmentType
}

/** 纯文本 */
export interface TextSegment extends Segment {
  type: 'text'
  data: {
    text: string
  }
}

/** QQ表情 */
export interface FaceSegment extends Segment {
  type: 'face'
  data: {
    id: string
  }
}

/** 图片消息段 */
export interface ImageSegment extends Segment {
  type: 'image'
  data: {
    file: string
    type?: 'flash'
    url?: string
    cache?: 0 | 1
    proxy?: 0 | 1
    timeout?: number
  }
}

/** 语音消息段 */
export interface RecordSegment extends Segment {
  type: 'record'
  data: {
    file: string
    magic?: 0 | 1
    url?: string
    cache?: 0 | 1
    proxy?: 0 | 1
    timeout?: number
  }
}

/** 短视频消息段 */
export interface VideoSegment extends Segment {
  type: 'video'
  data: {
    file: string
    url?: string
    cache?: 0 | 1
    proxy?: 0 | 1
    timeout?: number
  }
}

/** @某人消息段 */
export interface AtSegment extends Segment {
  type: 'at'
  data: {
    qq: string | 'all'
    name?: string
  }
}

/** 猜拳魔法表情消息段 */
export interface RpsSegment extends Segment {
  type: 'rps'
}

/** 掷骰子魔法表情消息段 */
export interface DiceSegment extends Segment {
  type: 'dice'
}

/** 窗口抖动（戳一戳）消息段 */
export interface ShakeSegment extends Segment {
  type: 'shake'
  data: object
}

/** 戳一戳消息段 */
export interface PokeSegment extends Segment {
  type: 'poke'
  data: {
    type: string
    id: string
    name?: string
  }
}

/** 匿名发消息消息段 */
export interface AnonymousSegment extends Segment {
  type: 'anonymous'
  data: {
    ignore?: 0 | 1
  }
}

/** 链接分享消息段 */
export interface ShareSegment extends Segment {
  type: 'share'
  data: {
    url: string
    title: string
    content?: string
    image?: string
  }
}

/** 推荐好友/群消息段 */
export interface ContactSegment extends Segment {
  type: 'contact'
  data: {
    type: 'qq' | 'group'
    id: string
  }
}

/** 位置消息段 */
export interface LocationSegment extends Segment {
  type: 'location'
  data: {
    lat: string
    lon: string
    title?: string
    content?: string
  }
}

/** 音乐分享消息段 */
export interface MusicSegment extends Segment {
  type: 'music'
  data: {
    type: 'qq' | '163' | 'xm'
    id: string
  }
}

/** 音乐自定义分享消息段 */
export interface CustomMusicSegment extends Segment {
  type: 'music'
  data: {
    type: 'custom'
    url: string
    audio: string
    title: string
    content?: string
    image?: string
  }
}

/** 回复消息段 */
export interface ReplySegment extends Segment {
  type: 'reply'
  data: {
    id: string
  }
}

export interface FileSegment extends Segment {
  type: 'file'
  data: {
    file: string
  }
}

/** 合并转发消息段 */
export interface ForwardSegment extends Segment {
  type: 'forward'
  data: {
    id: string
  }
}

/** XML消息段 */
export interface XmlSegment extends Segment {
  type: 'xml'
  data: {
    data: string
  }
}

/** JSON消息段 */
export interface JsonSegment extends Segment {
  type: 'json'
  data: {
    data: string
  }
}

/** OneBot11消息段 */
export type OB11SegmentBase =
  | TextSegment
  | FaceSegment
  | ImageSegment
  | RecordSegment
  | VideoSegment
  | AtSegment
  | RpsSegment
  | DiceSegment
  | ShakeSegment
  | PokeSegment
  | AnonymousSegment
  | ShareSegment
  | ContactSegment
  | LocationSegment
  | MusicSegment
  | CustomMusicSegment
  | ReplySegment
  | ForwardSegment
  | XmlSegment
  | JsonSegment
  | FileSegment

/** 合并转发已有消息节点消息段 */
export interface DirectNodeSegment extends Segment {
  type: 'node'
  data: {
    id: string
  }
}

/** 合并转发自定义节点消息段 */
export interface CustomNodeSegments extends Segment {
  type: 'node'
  data: {
    user_id: string
    nickname: string
    content: OB11Segment[]
    prompt?: string
    summary?: string
    source?: string
  }
}

/** 合并转发消息段 */
export type OB11NodeSegment = DirectNodeSegment | CustomNodeSegments

/** OneBot11消息段 */
export type OB11Segment = OB11SegmentBase | OB11NodeSegment
