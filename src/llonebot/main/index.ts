import { injectService, LoginListener, NodeIKernelLoginService } from '@/core';
import { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import { fetchServices } from '@/llonebot/main/proxy';
import { INapCatService } from '@/core';
import { InitWebUi } from '@/webui';
import { NapCatOnebot11 } from '@/onebot11/main';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';

class NapCatLLPluginImpl extends INapCatService {
  constructor(session: NodeIQQNTWrapperSession, wrapper: WrapperNodeApi, loginService: NodeIKernelLoginService) {
    super(session, wrapper);
    const ntLoginListener = new LoginListener();
    ntLoginListener.onQRCodeLoginSucceed = arg => {
      this.onLoginSuccessFuncList.forEach(func => func(arg.uin, arg.uid));
    };
    loginService.addKernelLoginListener(
      new wrapper.NodeIKernelLoginListener(
        new Proxy(ntLoginListener, this.proxyHandler)
      )
    );
  }
}

async function init() {
  const {
    wrapperSession,
    wrapperNodeApi,
    wrapperLoginService
  } = await fetchServices();

  const service = new NapCatLLPluginImpl(wrapperSession, wrapperNodeApi, wrapperLoginService);
  injectService(service);

  await InitWebUi();
  const NapCat_OneBot11 = new NapCatOnebot11();
  await WebUiDataRuntime.setOB11ConfigCall(NapCat_OneBot11.SetConfig);
}

init();
