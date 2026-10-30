import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getQQDataDirOverride } from 'napcat-common/src/path';
import type { WrapperNodeApi } from 'napcat-core';

export function getDataPaths (wrapper: WrapperNodeApi): [string, string] {
  const platform = os.platform();
  let dataPath = getQQDataDirOverride();
  if (dataPath) {
    // 自定义目录必须在初始化内核前存在；创建失败时不能回退到桌面 QQ。
    fs.mkdirSync(dataPath, { recursive: true });
  } else if (platform === 'darwin') {
    dataPath = path.resolve(os.homedir(), './Library/Application Support/QQ');
  } else {
    dataPath = wrapper.NodeQQNTWrapperUtil.getNTUserDataInfoConfig();
    if (!dataPath) {
      dataPath = path.resolve(os.homedir(), './.config/QQ');
      fs.mkdirSync(dataPath, { recursive: true });
    }
  }
  // Linux/macOS: global 直接位于数据目录下；Windows: 位于 nt_qq 子目录下。
  // 此处不创建 global，以免阻止后续 Linux 旧目录迁移。
  const dataPathGlobal = platform === 'linux' || platform === 'darwin'
    ? path.resolve(dataPath, 'global')
    : path.resolve(dataPath, 'nt_qq', 'global');
  return [dataPath, dataPathGlobal];
}
