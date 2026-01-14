// Satori Protocol Types
// Reference: https://satori.js.org/zh-CN/protocol/

// ============ 基础类型 ============

export interface SatoriUser {
  id: string;
  name?: string;
  nick?: string;
  avatar?: string;
  is_bot?: boolean;
}

export interface SatoriGuild {
  id: string;
  name?: string;
  avatar?: string;
}

export interface SatoriChannel {
  id: string;
  type: SatoriChannelType;
  name?: string;
  parent_id?: string;
}

export enum SatoriChannelType {
  TEXT = 0,
  DIRECT = 1,
  CATEGORY = 2,
  VOICE = 3,
}

export interface SatoriGuildMember {
  user?: SatoriUser;
  nick?: string;
  avatar?: string;
  joined_at?: number;
}

export interface SatoriGuildRole {
  id: string;
  name?: string;
}

export interface SatoriLogin {
  user?: SatoriUser;
  self_id?: string;
  platform?: string;
  status: SatoriLoginStatus;
}

export enum SatoriLoginStatus {
  OFFLINE = 0,
  ONLINE = 1,
  CONNECT = 2,
  DISCONNECT = 3,
  RECONNECT = 4,
}

// ============ 消息类型 ============

export interface SatoriMessage {
  id: string;
  content: string;
  channel?: SatoriChannel;
  guild?: SatoriGuild;
  member?: SatoriGuildMember;
  user?: SatoriUser;
  created_at?: number;
  updated_at?: number;
}

// ============ 事件类型 ============

export interface SatoriEvent {
  id: number;
  type: string;
  platform: string;
  self_id: string;
  timestamp: number;
  argv?: SatoriArgv;
  button?: SatoriButton;
  channel?: SatoriChannel;
  guild?: SatoriGuild;
  login?: SatoriLogin;
  member?: SatoriGuildMember;
  message?: SatoriMessage;
  operator?: SatoriUser;
  role?: SatoriGuildRole;
  user?: SatoriUser;
  _type?: string;
  _data?: Record<string, unknown>;
}

export interface SatoriArgv {
  name: string;
  arguments: unknown[];
  options: Record<string, unknown>;
}

export interface SatoriButton {
  id: string;
}

// ============ API 请求/响应类型 ============

export interface SatoriApiRequest {
  method: string;
  body?: Record<string, unknown>;
}

export interface SatoriApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

export interface SatoriPageResult<T> {
  data: T[];
  next?: string;
}

// ============ WebSocket 信令类型 ============

export enum SatoriOpcode {
  EVENT = 0,
  PING = 1,
  PONG = 2,
  IDENTIFY = 3,
  READY = 4,
}

export interface SatoriSignal<T = unknown> {
  op: SatoriOpcode;
  body?: T;
}

export interface SatoriIdentifyBody {
  token?: string;
  sequence?: number;
}

export interface SatoriReadyBody {
  logins: SatoriLogin[];
}

// ============ 消息元素类型 ============

export type SatoriElement =
  | SatoriTextElement
  | SatoriAtElement
  | SatoriSharpElement
  | SatoriAElement
  | SatoriImgElement
  | SatoriAudioElement
  | SatoriVideoElement
  | SatoriFileElement
  | SatoriBoldElement
  | SatoriItalicElement
  | SatoriUnderlineElement
  | SatoriStrikethroughElement
  | SatoriSpoilerElement
  | SatoriCodeElement
  | SatoriSupElement
  | SatoriSubElement
  | SatoriBrElement
  | SatoriParagraphElement
  | SatoriMessageElement
  | SatoriQuoteElement
  | SatoriAuthorElement
  | SatoriButtonElement;

export interface SatoriTextElement {
  type: 'text';
  attrs: {
    content: string;
  };
}

export interface SatoriAtElement {
  type: 'at';
  attrs: {
    id?: string;
    name?: string;
    role?: string;
    type?: string;
  };
}

export interface SatoriSharpElement {
  type: 'sharp';
  attrs: {
    id: string;
    name?: string;
  };
}

export interface SatoriAElement {
  type: 'a';
  attrs: {
    href: string;
  };
}

export interface SatoriImgElement {
  type: 'img';
  attrs: {
    src: string;
    title?: string;
    cache?: boolean;
    timeout?: string;
    width?: number;
    height?: number;
  };
}

export interface SatoriAudioElement {
  type: 'audio';
  attrs: {
    src: string;
    title?: string;
    cache?: boolean;
    timeout?: string;
    duration?: number;
    poster?: string;
  };
}

export interface SatoriVideoElement {
  type: 'video';
  attrs: {
    src: string;
    title?: string;
    cache?: boolean;
    timeout?: string;
    width?: number;
    height?: number;
    duration?: number;
    poster?: string;
  };
}

export interface SatoriFileElement {
  type: 'file';
  attrs: {
    src: string;
    title?: string;
    cache?: boolean;
    timeout?: string;
    poster?: string;
  };
}

export interface SatoriBoldElement {
  type: 'b' | 'strong';
  children: SatoriElement[];
}

export interface SatoriItalicElement {
  type: 'i' | 'em';
  children: SatoriElement[];
}

export interface SatoriUnderlineElement {
  type: 'u' | 'ins';
  children: SatoriElement[];
}

export interface SatoriStrikethroughElement {
  type: 's' | 'del';
  children: SatoriElement[];
}

export interface SatoriSpoilerElement {
  type: 'spl';
  children: SatoriElement[];
}

export interface SatoriCodeElement {
  type: 'code';
  children: SatoriElement[];
}

export interface SatoriSupElement {
  type: 'sup';
  children: SatoriElement[];
}

export interface SatoriSubElement {
  type: 'sub';
  children: SatoriElement[];
}

export interface SatoriBrElement {
  type: 'br';
}

export interface SatoriParagraphElement {
  type: 'p';
  children: SatoriElement[];
}

export interface SatoriMessageElement {
  type: 'message';
  attrs?: {
    id?: string;
    forward?: boolean;
  };
  children: SatoriElement[];
}

export interface SatoriQuoteElement {
  type: 'quote';
  attrs?: {
    id?: string;
  };
  children?: SatoriElement[];
}

export interface SatoriAuthorElement {
  type: 'author';
  attrs: {
    id?: string;
    name?: string;
    avatar?: string;
  };
}

export interface SatoriButtonElement {
  type: 'button';
  attrs: {
    id?: string;
    type?: 'action' | 'link' | 'input';
    href?: string;
    text?: string;
    theme?: string;
  };
}
