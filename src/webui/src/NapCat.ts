import { SettingList } from "./components/SettingList";
import { SettingItem } from "./components/SettingItem";
import { SettingButton } from "./components/SettingButton";
import { SettingSwitch } from "./components/SettingSwitch";
import { SettingSelect } from "./components/SettingSelect";
import { WebUiApi } from "./components/WebApi"
async function onSettingWindowCreated(view: Element) {
  const isEmpty = (value: any) => value === undefined || value === undefined || value === '';
  let ob11Config = await WebUiApi.getOB11Config();
  const setOB11Config = (key: string, value: any) => {
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    [
      '<div>',
      `<setting-section id="napcat-error">
            <setting-panel><pre><code></code></pre></setting-panel>
        </setting-section>`,
      SettingList([
        SettingItem(
          '<span id="napcat-update-title">正在检查 Napcat 更新</span>',
          undefined,
          SettingButton('请稍候', 'napcat-update-button', 'secondary'),
        ),
      ]),
      SettingList([
        SettingItem(
          '启用 HTTP 服务',
          undefined,
          SettingSwitch('ob11.enableHttp', ob11Config.enableHttp, { 'control-display-id': 'config-ob11-httpPort' }),
        ),
        SettingItem(
          'HTTP 服务监听端口',
          undefined,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.httpPort" type="number" min="1" max="65534" value="${ob11Config.httpPort}" placeholder="${ob11Config.httpPort}" /></div>`,
          'config-ob11-httpPort',
          ob11Config.enableHttp,
        ),
        SettingItem(
          '启用 HTTP 心跳',
          undefined,
          SettingSwitch('ob11.enableHttpHeart', ob11Config.enableHttpHeart, {
            'control-display-id': 'config-ob11-enableHttpHeart',
          }),
        ),
        SettingItem(
          '启用 HTTP 事件上报',
          undefined,
          SettingSwitch('ob11.enableHttpPost', ob11Config.enableHttpPost, {
            'control-display-id': 'config-ob11-httpHosts',
          }),
        ),
        `<div class="config-host-list" id="config-ob11-httpHosts" ${ob11Config.enableHttpPost ? '' : 'is-hidden'}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>HTTP 事件上报密钥</setting-text>
                    </div>
                    <div class="q-input">
                        <input id="config-ob11-httpSecret" class="q-input__inner" data-config-key="ob11.httpSecret" type="text" value="${ob11Config.httpSecret
        }" placeholder="未设置" />
                    </div>
                </setting-item>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>HTTP 事件上报地址</setting-text>
                    </div>
                    <setting-button id="config-ob11-httpHosts-add" data-type="primary">添加</setting-button>
                </setting-item>
                <div id="config-ob11-httpHosts-list"></div>
            </div>`,
        SettingItem(
          '启用正向 WebSocket 服务',
          undefined,
          SettingSwitch('ob11.enableWs', ob11Config.enableWs, { 'control-display-id': 'config-ob11-wsPort' }),
        ),
        SettingItem(
          '正向 WebSocket 服务监听端口',
          undefined,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.wsPort" type="number" min="1" max="65534" value="${ob11Config.wsPort}" placeholder="${ob11Config.wsPort}" /></div>`,
          'config-ob11-wsPort',
          ob11Config.enableWs,
        ),
        SettingItem(
          '启用反向 WebSocket 服务',
          undefined,
          SettingSwitch('ob11.enableWsReverse', ob11Config.enableWsReverse, {
            'control-display-id': 'config-ob11-wsHosts',
          }),
        ),
        `<div class="config-host-list" id="config-ob11-wsHosts" ${ob11Config.enableWsReverse ? '' : 'is-hidden'}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>反向 WebSocket 监听地址</setting-text>
                    </div>
                    <setting-button id="config-ob11-wsHosts-add" data-type="primary">添加</setting-button>
                </setting-item>
                <div id="config-ob11-wsHosts-list"></div>
            </div>`,
        SettingItem(
          ' WebSocket 服务心跳间隔',
          '控制每隔多久发送一个心跳包，单位为毫秒',
          `<div class="q-input"><input class="q-input__inner" data-config-key="heartInterval" type="number" min="1000" value="${ob11Config.heartInterval}" placeholder="${ob11Config.heartInterval}" /></div>`,
        ),
        SettingItem(
          'Access token',
          undefined,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="token" type="text" value="${ob11Config.token}" placeholder="未设置" /></div>`,
        ),
        SettingItem(
          '新消息上报格式',
          '如客户端无特殊需求推荐保持默认设置，两者的详细差异可参考 <a href="javascript:LiteLoader.api.openExternal(\'https://github.com/botuniverse/onebot-11/tree/master/message#readme\');">OneBot v11 文档</a>',
          SettingSelect(
            [
              { text: '消息段', value: 'array' },
              { text: 'CQ码', value: 'string' },
            ],
            'ob11.messagePostFormat',
            ob11Config.messagePostFormat,
          ),
        ),
        SettingItem(
          '音乐卡片签名地址',
          undefined,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="musicSignUrl" type="text" value="${ob11Config.musicSignUrl}" placeholder="未设置" /></div>`,
          'config-musicSignUrl',
        ),
        SettingItem('', undefined, SettingButton('保存', 'config-ob11-save', 'primary')),
      ]),
      SettingList([
        SettingItem(
          '上报 Bot 自身发送的消息',
          '上报 event 为 message_sent',
          SettingSwitch('reportSelfMessage', ob11Config.reportSelfMessage),
        )
      ]),
      SettingList([
        SettingItem('GitHub 仓库', `https://github.com/`, SettingButton('点个星星', 'open-github')),
        SettingItem('NapCat 文档', `https://`, SettingButton('看看文档', 'open-docs')),
        SettingItem('Telegram 群', `https://t.me/+nLZEnpne-pQ1OWFl`, SettingButton('进去逛逛', 'open-telegram')),
        SettingItem('QQ 群', `545402644`, SettingButton('我要进去', 'open-qq-group')),
      ]),
      '</div>',
    ].join(''),
    'text/html',
  )

  // 外链按钮
  doc.querySelector('#open-github')?.addEventListener('click', () => {
    window.open("https://github.com/", '_blank');
  })
  doc.querySelector('#open-telegram')?.addEventListener('click', () => {
    window.open('https://t.me/+nLZEnpne-pQ1OWFl')
  })
  doc.querySelector('#open-qq-group')?.addEventListener('click', () => {
    window.open('https://qm.qq.com/q/bDnHRG38aI')
  })
  doc.querySelector('#open-docs')?.addEventListener('click', () => {
    window.open('https://github.io/')
  })
  // 生成反向地址列表
  const buildHostListItem = (type: string, host: string, index: number, inputAttrs: any = {}) => {
    const dom = {
      container: document.createElement('setting-item'),
      input: document.createElement('input'),
      inputContainer: document.createElement('div'),
      deleteBtn: document.createElement('setting-button'),
    }
    dom.container.classList.add('setting-host-list-item')
    dom.container.dataset.direction = 'row'
    Object.assign(dom.input, inputAttrs)
    dom.input.classList.add('q-input__inner')
    dom.input.type = 'url'
    dom.input.value = host
    dom.input.addEventListener('input', () => {
      ob11Config[type][index] = dom.input.value
    })

    dom.inputContainer.classList.add('q-input')
    dom.inputContainer.appendChild(dom.input)

    dom.deleteBtn.innerHTML = '删除'
    dom.deleteBtn.dataset.type = 'secondary'
    dom.deleteBtn.addEventListener('click', () => {
      ob11Config[type].splice(index, 1)
      initReverseHost(type)
    })

    dom.container.appendChild(dom.inputContainer)
    dom.container.appendChild(dom.deleteBtn)

    return dom.container
  }
  const buildHostList = (hosts: string[], type: string, inputAttr: any = {}) => {
    const result: HTMLElement[] = []

    hosts.forEach((host, index) => {
      result.push(buildHostListItem(type, host, index, inputAttr))
    })

    return result
  }
  const addReverseHost = (type: string, doc: Document = document, inputAttr: any = {}) => {
    const hostContainerDom = doc.body.querySelector(`#config-ob11-${type}-list`);
    hostContainerDom?.appendChild(buildHostListItem(type, '', ob11Config[type].length, inputAttr));
    ob11Config[type].push('');
  }
  const initReverseHost = (type: string, doc: Document = document) => {
    const hostContainerDom = doc.body?.querySelector(`#config-ob11-${type}-list`);
    //@ts-ignore 等待修复
    [...hostContainerDom.childNodes].forEach((dom) => dom.remove());
    buildHostList(ob11Config[type], type).forEach((dom) => {
      hostContainerDom?.appendChild(dom);
    })
  }
  initReverseHost('httpHosts', doc);
  initReverseHost('wsHosts', doc);

  doc
    .querySelector('#config-ob11-httpHosts-add')
    ?.addEventListener('click', () =>
      addReverseHost('httpHosts', document, { placeholder: '如：http://127.0.0.1:5140/onebot' }),
    )
  doc
    .querySelector('#config-ob11-wsHosts-add')
    ?.addEventListener('click', () =>
      addReverseHost('wsHosts', document, { placeholder: '如：ws://127.0.0.1:5140/onebot' }),
    )

  doc.querySelector('#config-ffmpeg-select')?.addEventListener('click', () => {
    //选择ffmpeg
  })

  doc.querySelector('#config-open-log-path')?.addEventListener('click', () => {
    //打开日志
  })

  // 开关
  doc.querySelectorAll('setting-switch[data-config-key]').forEach((dom: Element) => {
    dom.addEventListener('click', () => {
      const active = dom.getAttribute('is-active') === undefined
      //@ts-ignore 等待修复
      setOB11Config(dom.dataset.configKey, active)
      if (active) dom.setAttribute('is-active', '')
      else dom.removeAttribute('is-active')
      //@ts-ignore 等待修复
      if (!isEmpty(dom.dataset.controlDisplayId)) {
        //@ts-ignore 等待修复
        const displayDom = document.querySelector(`#${dom.dataset.controlDisplayId}`)
        if (active) displayDom?.removeAttribute('is-hidden')
        else displayDom?.setAttribute('is-hidden', '')
      }
    })
  })

  // 输入框
  doc
    .querySelectorAll('setting-item .q-input input.q-input__inner[data-config-key]')
    .forEach((dom: Element) => {
      dom.addEventListener('input', () => {
        const Type = dom.getAttribute('type')
        //@ts-ignore 等待修复
        const configKey = dom.dataset.configKey
        const configValue = Type === 'number' ? (parseInt((dom as HTMLInputElement).value) >= 1 ? parseInt((dom as HTMLInputElement).value) : 1) : (dom as HTMLInputElement).value

        setOB11Config(configKey, configValue)
      })
    })

  // 下拉框
  doc.querySelectorAll('ob-setting-select[data-config-key]').forEach((dom: Element) => {
    //@ts-ignore 等待修复
    dom?.addEventListener('selected', (e: CustomEvent) => {
      //@ts-ignore 等待修复
      const configKey = dom.dataset.configKey
      const configValue = e.detail.value
      setOB11Config(configKey, configValue);
    })
  })

  // 保存按钮
  doc.querySelector('#config-ob11-save')?.addEventListener('click', () => {
    WebUiApi.setOB11Config(ob11Config);
    alert('保存成功');
  })
}
export { onSettingWindowCreated };