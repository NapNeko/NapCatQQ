import { getFullQQVesion, QQVersionAppid } from '@/common/utils/QQBasicInfo';
import { hostname, systemName, systemVersion } from '@/common/utils/system';
import path from 'node:path';
import fs from 'node:fs';
import { getMachineId } from '@/common/utils/system';
// 补充
export enum PlatformType {
  KUNKNOWN,
  KANDROID,
  KIOS,
  KWINDOWS,
  KMAC
}
export enum DeviceType {
  KUNKNOWN,
  KPHONE,
  KPAD,
  KCOMPUTER
}
//推送类型
export enum VendorType {
  KNOSETONIOS = 0,
  KSUPPORTGOOGLEPUSH = 99,
  KSUPPORTHMS = 3,
  KSUPPORTOPPOPUSH = 4,
  KSUPPORTTPNS = 2,
  KSUPPORTVIVOPUSH = 5,
  KUNSUPPORTANDROIDPUSH = 1
}
export interface WrapperSessionInitConfig {
  selfUin: string
  selfUid: string
  desktopPathConfig: {
    account_path: string // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
  }
  clientVer: string  // 9.9.8-22355
  a2: string,
  d2: string,
  d2Key: string,
  machineId: string,
  platform: PlatformType,  // 3是Windows?
  platVer: string,  // 系统版本号, 应该可以固定
  appid: string,
  rdeliveryConfig: {
    appKey: string,
    systemId: number,
    appId: string,
    logicEnvironment: string,
    platform: PlatformType,
    language: string,
    sdkVersion: string,
    userId: string,
    appVersion: string,
    osVersion: string,
    bundleId: string,
    serverUrl: string,
    fixedAfterHitKeys: string[]
  }
  defaultFileDownloadPath: string, // 这个可以通过环境变量获取？
  deviceInfo: {
    guid: string,
    buildVer: string,
    localId: number,
    devName: string,
    devType: string,
    vendorName: string,
    osVer: string,
    vendorOsName: string,
    setMute: boolean,
    vendorType: VendorType
  },
  deviceConfig: '{"appearance":{"isSplitViewMode":true},"msg":{}}'
}

export const sessionConfig: WrapperSessionInitConfig | any = {};

export async function genSessionConfig(selfUin: string, selfUid: string, account_path: string): Promise<WrapperSessionInitConfig> {
  const downloadPath = path.join(account_path, 'NapCat', 'temp');
  fs.mkdirSync(downloadPath, { recursive: true });
  let guid: string = await getMachineId();//26702 支持JS获取guid值 在LoginService中获取 TODO mlikiow a
  //console.log(guid);
  // guid =  '52afb776-82f6-4e59-9d38-44705b112d0a';
  //let guid: string = await getMachineId();
  const config: WrapperSessionInitConfig = {
    selfUin,
    selfUid,
    desktopPathConfig: {
      account_path // 可以通过NodeQQNTWrapperUtil().getNTUserDataInfoConfig()获取
    },
    clientVer: getFullQQVesion(),  // 9.9.8-22355
    a2: '',
    d2: '',
    d2Key: '',
    machineId: '',
    platform: PlatformType.KWINDOWS,  // 3是Windows?
    platVer: systemVersion,  // 系统版本号, 应该可以固定
    appid: QQVersionAppid,
    rdeliveryConfig: {
      appKey: '',
      systemId: 0,
      appId: '',
      logicEnvironment: '',
      platform: PlatformType.KWINDOWS,
      language: '',
      sdkVersion: '',
      userId: '',
      appVersion: '',
      osVersion: '',
      bundleId: '',
      serverUrl: '',
      fixedAfterHitKeys: ['']
    },
    defaultFileDownloadPath: downloadPath,
    deviceInfo: {
      guid,
      buildVer: getFullQQVesion(),
      localId: 2052,
      devName: hostname,
      devType: systemName,
      vendorName: '',
      osVer: systemVersion,
      vendorOsName: systemName,
      setMute: false,
      vendorType: VendorType.KNOSETONIOS
    },
    deviceConfig: '{"appearance":{"isSplitViewMode":true},"msg":{}}'
  };
  Object.assign(sessionConfig, config);
  return config;
}
