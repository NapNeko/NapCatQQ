// 方案一 MiniApp发包方案
// 前置条件： 处于GUI环境 存在MiniApp

import { NTQQSystemApi } from '@/core';

// 前排提示： 开发验证仅Win平台开展
export class MiniAppUtil {
  static async RunMiniAppWithGUI() {
    //process.env.ELECTRON_RUN_AS_NODE = undefined;//没用还是得自己用cpp之类的语言写个程序转发参数
    return NTQQSystemApi.BootMiniApp(process.execPath, 'miniapp://open/1007?url=https%3A%2F%2Fm.q.qq.com%2Fa%2Fs%2Fedd0a83d3b8afe233dfa07adaaf8033f%3Fscene%3D1007%26min_refer%3D10001');
  }
}
// 方案二 MiniApp发包方案 替代MiniApp方案
// 前置条件： 无
export class MojoMiniAppUtil{

}