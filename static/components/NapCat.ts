
import StyleRaw from './style.css?raw'

// 打开设置界面时触发

function aprilFoolsEgg(node: Element) {
function initSideBar() {
  document.querySelectorAll('.nav-item.liteloader').forEach((node) => {
    if (node.textContent.startsWith('LLOneBot')) {
      aprilFoolsEgg(node)
      let iconEle = node.querySelector('.q-icon')
      iconEle.innerHTML = iconSvg
    }
  })
}

async function onSettingWindowCreated(view: Element) {
  window.llonebot.log('setting window created')
  initSideBar()
  const isEmpty = (value: any) => value === undefined || value === null || value === ''
  let config = await window.llonebot.getConfig()
  let ob11Config = { ...config.ob11 }
  const setConfig = (key: string, value: any) => {
    const configKey = key.split('.')

    if (key.indexOf('ob11') === 0) {
      if (configKey.length === 2) ob11Config[configKey[1]] = value
      else ob11Config[key] = value
    } else {
      if (configKey.length === 2) config[configKey[0]][configKey[1]] = value
      else config[key] = value

      if (!['heartInterval', 'token', 'ffmpeg'].includes(key)) {
        window.llonebot.setConfig(false, config)
      }
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(
    [
      '<div>',
      `<style>${StyleRaw}</style>`,
      `<setting-section id="llonebot-error">
            <setting-panel><pre><code></code></pre></setting-panel>
        </setting-section>`,
      SettingList([
        SettingItem(
          '<span id="llonebot-update-title">正在检查 LLOneBot 更新</span>',
          null,
          SettingButton('请稍候', 'llonebot-update-button', 'secondary'),
        ),
      ]),
      SettingList([
        SettingItem(
          '启用 HTTP 服务',
          null,
          SettingSwitch('ob11.enableHttp', config.ob11.enableHttp, { 'control-display-id': 'config-ob11-httpPort' }),
        ),
        SettingItem(
          'HTTP 服务监听端口',
          null,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.httpPort" type="number" min="1" max="65534" value="${config.ob11.httpPort}" placeholder="${config.ob11.httpPort}" /></div>`,
          'config-ob11-httpPort',
          config.ob11.enableHttp,
        ),
        SettingItem(
          '启用 HTTP 心跳',
          null,
          SettingSwitch('ob11.enableHttpHeart', config.ob11.enableHttpHeart, {
            'control-display-id': 'config-ob11-enableHttpHeart',
          }),
        ),
        SettingItem(
          '启用 HTTP 事件上报',
          null,
          SettingSwitch('ob11.enableHttpPost', config.ob11.enableHttpPost, {
            'control-display-id': 'config-ob11-httpHosts',
          }),
        ),
        `<div class="config-host-list" id="config-ob11-httpHosts" ${config.ob11.enableHttpPost ? '' : 'is-hidden'}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>HTTP 事件上报密钥</setting-text>
                    </div>
                    <div class="q-input">
                        <input id="config-ob11-httpSecret" class="q-input__inner" data-config-key="ob11.httpSecret" type="text" value="${
                          config.ob11.httpSecret
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
          null,
          SettingSwitch('ob11.enableWs', config.ob11.enableWs, { 'control-display-id': 'config-ob11-wsPort' }),
        ),
        SettingItem(
          '正向 WebSocket 服务监听端口',
          null,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.wsPort" type="number" min="1" max="65534" value="${config.ob11.wsPort}" placeholder="${config.ob11.wsPort}" /></div>`,
          'config-ob11-wsPort',
          config.ob11.enableWs,
        ),
        SettingItem(
          '启用反向 WebSocket 服务',
          null,
          SettingSwitch('ob11.enableWsReverse', config.ob11.enableWsReverse, {
            'control-display-id': 'config-ob11-wsHosts',
          }),
        ),
        `<div class="config-host-list" id="config-ob11-wsHosts" ${config.ob11.enableWsReverse ? '' : 'is-hidden'}>
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
          `<div class="q-input"><input class="q-input__inner" data-config-key="heartInterval" type="number" min="1000" value="${config.heartInterval}" placeholder="${config.heartInterval}" /></div>`,
        ),
        SettingItem(
          'Access token',
          null,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="token" type="text" value="${config.token}" placeholder="未设置" /></div>`,
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
            config.ob11.messagePostFormat,
          ),
        ),
        SettingItem(
          'ffmpeg 路径，发送语音、视频需要，同时保证ffprobe和ffmpeg在一起',
          ` <a href="javascript:LiteLoader.api.openExternal(\'https://llonebot.github.io/zh-CN/guide/ffmpeg\');">下载地址</a> <span id="config-ffmpeg-path-text">, 路径:${
            !isEmpty(config.ffmpeg) ? config.ffmpeg : '未指定'
          }</span>`,
          SettingButton('选择ffmpeg', 'config-ffmpeg-select'),
        ),
        SettingItem(
          '音乐卡片签名地址',
          null,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="musicSignUrl" type="text" value="${config.musicSignUrl}" placeholder="未设置" /></div>`,
          'config-musicSignUrl',
        ),
        SettingItem('', null, SettingButton('保存', 'config-ob11-save', 'primary')),
      ]),
      SettingList([
        SettingItem(
          '戳一戳消息, 暂时只支持Windows版的LLOneBot',
          `重启QQ后生效，如果导致QQ崩溃请勿开启此项, 群戳一戳只能收到群号`,
          SettingSwitch('enablePoke', config.enablePoke),
        ),
        SettingItem(
          '使用 Base64 编码获取文件',
          '调用 /get_image、/get_record、/get_file 时，没有 url 时添加 Base64 字段',
          SettingSwitch('enableLocalFile2Url', config.enableLocalFile2Url),
        ),
        SettingItem('调试模式', '开启后上报信息会添加 raw 字段以附带原始信息', SettingSwitch('debug', config.debug)),
        SettingItem(
          '上报 Bot 自身发送的消息',
          '上报 event 为 message_sent',
          SettingSwitch('reportSelfMessage', config.reportSelfMessage),
        ),
        SettingItem(
          '自动删除收到的文件',
          '在收到文件后的指定时间内删除该文件',
          SettingSwitch('autoDeleteFile', config.autoDeleteFile, {
            'control-display-id': 'config-auto-delete-file-second',
          }),
        ),
        SettingItem(
          '自动删除文件时间',
          '单位为秒',
          `<div class="q-input"><input class="q-input__inner" data-config-key="autoDeleteFileSecond" type="number" min="1" value="${config.autoDeleteFileSecond}" placeholder="${config.autoDeleteFileSecond}" /></div>`,
          'config-auto-delete-file-second',
          config.autoDeleteFile,
        ),
        SettingItem('写入日志', `将日志文件写入插件的数据文件夹`, SettingSwitch('log', config.log)),
        SettingItem(
          '日志文件目录',
          `${window.LiteLoader.plugins['LLOneBot'].path.data}/logs`,
          SettingButton('打开', 'config-open-log-path'),
        ),
      ]),
      SettingList([
        SettingItem('GitHub 仓库', `https://github.com/LLOneBot/LLOneBot`, SettingButton('点个星星', 'open-github')),
        SettingItem('LLOneBot 文档', `https://llonebot.github.io/`, SettingButton('看看文档', 'open-docs')),
        SettingItem('Telegram 群', `https://t.me/+nLZEnpne-pQ1OWFl`, SettingButton('进去逛逛', 'open-telegram')),
        SettingItem('QQ 群', `545402644`, SettingButton('我要进去', 'open-qq-group')),
      ]),
      '</div>',
    ].join(''),
    'text/html',
  )

  const showError = async () => {
    await new Promise((res) => setTimeout(() => res(true), 1000))

    const errDom = document.querySelector('#llonebot-error') || doc.querySelector('#llonebot-error')
    const errCodeDom = errDom.querySelector('code')
    const errMsg = await window.llonebot.getError()

    if (!errMsg) {
      errDom.classList.remove('show')
    } else {
      errDom.classList.add('show')
    }
    errCodeDom.innerHTML = errMsg
  }
  showError().then()

  // 外链按钮
  doc.querySelector('#open-github').addEventListener('click', () => {
    window.LiteLoader.api.openExternal('https://github.com/LLOneBot/LLOneBot')
  })
  doc.querySelector('#open-telegram').addEventListener('click', () => {
    window.LiteLoader.api.openExternal('https://t.me/+nLZEnpne-pQ1OWFl')
  })
  doc.querySelector('#open-qq-group').addEventListener('click', () => {
    window.LiteLoader.api.openExternal('https://qm.qq.com/q/bDnHRG38aI')
  })
  doc.querySelector('#open-docs').addEventListener('click', () => {
    window.LiteLoader.api.openExternal('https://llonebot.github.io/')
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
    const hostContainerDom = doc.body.querySelector(`#config-ob11-${type}-list`)
    hostContainerDom.appendChild(buildHostListItem(type, '', ob11Config[type].length, inputAttr))
    ob11Config[type].push('')
  }
  const initReverseHost = (type: string, doc: Document = document) => {
    const hostContainerDom = doc.body.querySelector(`#config-ob11-${type}-list`)
    ;[...hostContainerDom.childNodes].forEach((dom) => dom.remove())
    buildHostList(ob11Config[type], type).forEach((dom) => {
      hostContainerDom.appendChild(dom)
    })
  }
  initReverseHost('httpHosts', doc)
  initReverseHost('wsHosts', doc)

  doc
    .querySelector('#config-ob11-httpHosts-add')
    .addEventListener('click', () =>
      addReverseHost('httpHosts', document, { placeholder: '如：http://127.0.0.1:5140/onebot' }),
    )
  doc
    .querySelector('#config-ob11-wsHosts-add')
    .addEventListener('click', () =>
      addReverseHost('wsHosts', document, { placeholder: '如：ws://127.0.0.1:5140/onebot' }),
    )

  doc.querySelector('#config-ffmpeg-select').addEventListener('click', () => {
    window.llonebot.selectFile().then((path) => {
      if (!isEmpty(path)) {
        setConfig('ffmpeg', path)
        document.querySelector('#config-ffmpeg-path-text').innerHTML = path
      }
    })
  })

  doc.querySelector('#config-open-log-path').addEventListener('click', () => {
    window.LiteLoader.api.openPath(window.LiteLoader.plugins['LLOneBot'].path.data)
  })

  // 开关
  doc.querySelectorAll('setting-switch[data-config-key]').forEach((dom: HTMLElement) => {
    dom.addEventListener('click', () => {
      const active = dom.getAttribute('is-active') === null

      setConfig(dom.dataset.configKey, active)

      if (active) dom.setAttribute('is-active', '')
      else dom.removeAttribute('is-active')

      if (!isEmpty(dom.dataset.controlDisplayId)) {
        const displayDom = document.querySelector(`#${dom.dataset.controlDisplayId}`)
        if (active) displayDom.removeAttribute('is-hidden')
        else displayDom.setAttribute('is-hidden', '')
      }
    })
  })

  // 输入框
  doc
    .querySelectorAll('setting-item .q-input input.q-input__inner[data-config-key]')
    .forEach((dom: HTMLInputElement) => {
      dom.addEventListener('input', () => {
        const Type = dom.getAttribute('type')
        const configKey = dom.dataset.configKey
        const configValue = Type === 'number' ? (parseInt(dom.value) >= 1 ? parseInt(dom.value) : 1) : dom.value

        setConfig(configKey, configValue)
      })
    })

  // 下拉框
  doc.querySelectorAll('ob-setting-select[data-config-key]').forEach((dom: HTMLElement) => {
    dom.addEventListener('selected', (e: CustomEvent) => {
      const configKey = dom.dataset.configKey
      const configValue = e.detail.value

      setConfig(configKey, configValue)
    })
  })

  // 保存按钮
  doc.querySelector('#config-ob11-save').addEventListener('click', () => {
    config.ob11 = ob11Config

    window.llonebot.setConfig(false, config)
    // window.location.reload();
    showError().then()
    alert('保存成功')
  })

  doc.body.childNodes.forEach((node) => {
    view.appendChild(node)
  })
  // 更新逻辑
  async function checkVersionFunc(ResultVersion: CheckVersion) {
    const titleDom = view.querySelector<HTMLSpanElement>('#llonebot-update-title')!
    const buttonDom = view.querySelector<HTMLButtonElement>('#llonebot-update-button')!

    if (ResultVersion.version === '') {
      titleDom.innerHTML = '检查更新失败'
      buttonDom.innerHTML = '点击重试'

      buttonDom.addEventListener('click', async () => {
        window.llonebot.checkVersion().then(checkVersionFunc)
      })

      return
    }
    if (!ResultVersion.result) {
      titleDom.innerHTML = '当前已是最新版本 v' + ResultVersion.version
      buttonDom.innerHTML = '无需更新'
    } else {
      titleDom.innerHTML = '已检测到最新版本 v' + ResultVersion.version
      buttonDom.innerHTML = '点击更新'
      buttonDom.dataset.type = 'primary'

      const update = async () => {
        buttonDom.innerHTML = '正在更新中...'
        const result = await window.llonebot.updateLLOneBot()
        if (result) {
          buttonDom.innerHTML = '更新完成，请重启'
        } else {
          buttonDom.innerHTML = '更新失败，前往仓库下载'
        }

        buttonDom.removeEventListener('click', update)
      }
      buttonDom.addEventListener('click', update)
    }
  }
  window.llonebot.checkVersion().then(checkVersionFunc)
  window.addEventListener('beforeunload', (event) => {
    if (JSON.stringify(ob11Config) === JSON.stringify(config.ob11)) return
    config.ob11 = ob11Config
    window.llonebot.setConfig(true, config)
  })
}

function init() {
  const hash = location.hash
  if (hash === '#/blank') {
  }
}

if (location.hash === '#/blank') {
  ;(window as any).navigation.addEventListener('navigatesuccess', init, { once: true })
} else {
  init()
}

export { onSettingWindowCreated }