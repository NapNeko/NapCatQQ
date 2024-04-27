import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '../../../common/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';


export class GetCookies extends BaseAction<null, null> {
  actionName = ActionName.GetCookies;

  protected async _handle(payload: null) {
    // 取Skey
    // 先NodeIKernelTicketService.forceFetchClientKey('')
    // 返回值
    // {
    //     result: 0,
    //     errMsg: '',
    //     url: '',
    //     keyIndex: '19',
    //     clientKey: 'clientKey',
    //     expireTime: '7200'
    //   }
    // request https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=1627126029&clientkey=key
    // &u1=https%3A%2F%2Fh5.qzone.qq.com%2Fqqnt%2Fqzoneinpcqq%2Ffriend%3Frefresh%3D0%26clientuin%3D0%26darkMode%3D0&keyindex=keyIndex
    // 取Location
    // onBeforeSendHeaders info  {"sec-ch-ua":"\\"Not_A Brand\\";v=\\"8\\", \\"Chromium\\";v=\\"120\\"","Accept":"application/json, text/plain, */*","sec-ch-ua-mobile":"?0","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) QQ/9.9.9-23159 Chrome/120.0.6099.56 Electron/28.0.0 Safari/537.36 OS/win32,x64,10.0.26100,Windows 10 Pro","sec-ch-ua-platform":"\\"Windows\\"","Origin":"https://h5.qzone.qq.com","Sec-Fetch-Site":"cross-site","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Accept-Encoding":"gzip, deflate, br","Accept-Language":"zh-CN","referer":"https://h5.qzone.qq.com","Referer":"https://h5.qzone.qq.com","origin":"https://h5.qzone.qq.com"}
    // 取Pskey 
    // NodeIKernelTipOffService.getPskey([ 'qun.qq.com' ], true )
    // {
    //     result: 0,
    //     errMsg: 'success',
    //     domainPskeyMap: Map(1) {
    //       'qun.qq.com' => 'pskey'
    //     }
    //   }
    return null;
  }
}
