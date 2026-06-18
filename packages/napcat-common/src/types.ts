// QQVersionType
export type QQPackageInfoType = {
  version: string;
  buildVersion: string;
  platform: string;
  eleArch: string;
};
export type QQVersionConfigType = {
  baseVersion: string;
  curVersion: string;
  prevVersion: string;
  onErrorVersions: Array<unknown>;
  buildId: string;
};
export type QQAppidTableType = {
  [key: string]: { appid: string, qua: string };
};
export interface Peer {
  chatType: number; // 聊天类型
  peerUid: string;    // 对等方的唯一标识符
  guildId?: string;   // 可选的频道ID
}
export interface QQLevel {
  crownNum: number;
  sunNum: number;
  moonNum: number;
  starNum: number;
}
