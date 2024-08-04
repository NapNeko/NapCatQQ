import path from 'node:path';
import fs from 'node:fs';
import { systemPlatform } from '@/common/utils/system';
import { getDefaultQQVersionConfigInfo, getQQVersionConfigPath } from './helper';

//基础目录获取
export let QQMainPath = process.execPath;
export let QQPackageInfoPath: string = path.join(path.dirname(QQMainPath), 'resources', 'app', 'package.json');
export let QQVersionConfigPath: string | undefined = getQQVersionConfigPath(QQMainPath);

//基础信息获取 无快更则启用默认模板填充
export let QQVersionAppid: string = systemPlatform === 'linux' ? '537237950' : '537237765';
export let isQuickUpdate: boolean = !!QQVersionConfigPath;
export let QQVersionConfig: QQVersionConfigType = isQuickUpdate ? JSON.parse(fs.readFileSync(QQVersionConfigPath!).toString()) : getDefaultQQVersionConfigInfo();
export let QQPackageInfo: QQPackageInfoType = JSON.parse(fs.readFileSync(QQPackageInfoPath).toString());

//基础函数
export function getQQBuildStr() {
  return isQuickUpdate ? QQVersionConfig.buildId : QQPackageInfo.buildVersion;
}
export function getFullQQVesion() {
  return isQuickUpdate ? QQVersionConfig.curVersion : QQPackageInfo.version;
}
export function requireMinNTQQBuild(buildStr: string) {
  return parseInt(getQQBuildStr()) >= parseInt(buildStr);
}
export function getQUA() {
  return systemPlatform === 'linux' ? `V1_LNX_NQ_${getFullQQVesion()}_${getQQBuildStr()}_GW_B` : `V1_WIN_NQ_${getFullQQVesion()}_${getQQBuildStr()}_GW_B`;
}
// platform_type: 3,
// app_type: 4,
// app_version: '9.9.12-25765',
// qua: 'V1_WIN_NQ_9.9.12_25765_GW_B',
// appid: '537234702',
// platVer: '10.0.26100',
// clientVer: '9.9.9-25765',
// Linux
// app_version: '3.2.9-25765',
// qua: 'V1_LNX_NQ_3.2.10_25765_GW_B',
