// NapCat Protocol 消息类型定义

export interface NapCatProtocolMessage {
  post_type: 'message' | 'notice' | 'request' | 'meta_event';
  time: number;
  self_id: number;
  message_type?: 'private' | 'group';
  sub_type?: string;
  message_id?: number;
  user_id?: number;
  group_id?: number;
  message?: NapCatProtocolMessageSegment[] | string;
  raw_message?: string;
  sender?: NapCatProtocolSender;
}

export interface NapCatProtocolMessageSegment {
  type: string;
  data: Record<string, unknown>;
}

export interface NapCatProtocolSender {
  user_id: number;
  nickname: string;
  card?: string;
  sex?: 'male' | 'female' | 'unknown';
  age?: number;
  area?: string;
  level?: string;
  role?: 'owner' | 'admin' | 'member';
  title?: string;
}

// API 请求类型
export interface NapCatProtocolRequest {
  action: string;
  params?: Record<string, unknown>;
  echo?: string | number;
}

// API 响应类型
export interface NapCatProtocolResponse<T = unknown> {
  status: 'ok' | 'failed';
  retcode: number;
  data: T | null;
  message?: string;
  echo?: string | number;
}

// 心跳事件
export interface NapCatProtocolHeartbeat {
  post_type: 'meta_event';
  meta_event_type: 'heartbeat';
  time: number;
  self_id: number;
  status: {
    online: boolean;
    good: boolean;
  };
  interval: number;
}

// 生命周期事件
export interface NapCatProtocolLifecycle {
  post_type: 'meta_event';
  meta_event_type: 'lifecycle';
  time: number;
  self_id: number;
  sub_type: 'connect' | 'enable' | 'disable';
}
