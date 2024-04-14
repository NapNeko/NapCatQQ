import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { systemPlatform } from '@/common/utils/system';

export const exePath = process.execPath;

export const pkgInfoPath = path.join(path.dirname(exePath), 'resources', 'app', 'package.json');
let configVersionInfoPath;

if (os.platform() !== 'linux') {
  configVersionInfoPath = path.join(path.dirname(exePath), 'resources', 'app', 'versions', 'config.json');
} else {
  const userPath = os.homedir();
  const appDataPath = path.resolve(userPath, './.config/QQ');
  configVersionInfoPath = path.resolve(appDataPath, './versions/config.json');
}

if (typeof configVersionInfoPath !== 'string') {
  throw new Error('Something went wrong when load QQ info path');
}

export { configVersionInfoPath };

type QQPkgInfo = {
  version: string;
  buildVersion: string;
  platform: string;
  eleArch: string;
}
type QQVersionConfigInfo = {
  baseVersion: string;
  curVersion: string;
  prevVersion: string;
  onErrorVersions: Array<any>;
  buildId: string;
}

let _qqVersionConfigInfo: QQVersionConfigInfo = {
  'baseVersion': '9.9.9-22578',
  'curVersion': '9.9.9-22578',
  'prevVersion': '',
  'onErrorVersions': [],
  'buildId': '22578'
};

if (fs.existsSync(configVersionInfoPath)) {
  _qqVersionConfigInfo = JSON.parse(fs.readFileSync(configVersionInfoPath).toString());
}

export const qqVersionConfigInfo: QQVersionConfigInfo = _qqVersionConfigInfo;

export const qqPkgInfo: QQPkgInfo = require(pkgInfoPath);

let _appid: string = '537213335';  // 默认为 Windows 平台的 appid
if (systemPlatform === 'linux') {
  _appid = '537213710';
}
// todo: mac 平台的 appid
export const appid = _appid;
