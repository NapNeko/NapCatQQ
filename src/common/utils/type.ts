//QQVersionType
type QQPackageInfoType = {
  version: string;
  buildVersion: string;
  platform: string;
  eleArch: string;
}
type QQVersionConfigType = {
  baseVersion: string;
  curVersion: string;
  prevVersion: string;
  onErrorVersions: Array<any>;
  buildId: string;
}
type QQAppidTableType = {
  [key: string]: { appid: string, qua: string };
}