const SettingList = (items, title, isCollapsible = false, direction = "column") => {
  return `<setting-section ${""}>
      <setting-panel>
          <setting-list ${direction ? `data-direction="${direction}"` : ""} ${isCollapsible ? "is-collapsible" : ""} ${""}>
              ${items.join("")}
          </setting-list>
      </setting-panel>
  </setting-section>`;
};

const SettingItem = (title, subtitle, action, id, visible = true) => {
  return `<setting-item ${id ? `id="${id}"` : ""} ${!visible ? "is-hidden" : ""}>
      <div>
          <setting-text>${title}</setting-text>
          ${subtitle ? `<setting-text data-type="secondary">${subtitle}</setting-text>` : ""}
      </div>
      ${action ? `<div>${action}</div>` : ""}
  </setting-item>`;
};

const SettingButton = (text, id, type = "secondary") => {
  return `<setting-button ${type ? `data-type="${type}"` : ""} ${id ? `id="${id}"` : ""}>${text}</setting-button>`;
};

const SettingSwitch = (configKey, isActive = false, extraData) => {
  return `<setting-switch 
      ${configKey ? `data-config-key="${configKey}"` : ""} 
      ${isActive ? "is-active" : ""} 
      ${extraData ? Object.keys(extraData).map((key) => `data-${key}="${extraData[key]}"`) : ""} 
      >
  </setting-switch>`;
};

const SettingOption = (text, value, isSelected = false) => {
  return `<setting-option ${value ? `data-value="${value}"` : ""} ${isSelected ? "is-selected" : ""}>${text}</setting-option>`;
};

const SelectTemplate = document.createElement("template");
SelectTemplate.innerHTML = `<style>
    .hidden { display: none !important; }
</style>
<div part="parent">
        <div part="button">
            <input type="text" placeholder="请选择" part="current-text" />
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" part="button-arrow">
                <path d="M12 6.0001L8.00004 10L4 6" stroke="currentColor" stroke-linejoin="round"></path>
            </svg>
        </div>
    <ul class="hidden" part="option-list"><slot></slot></ul>
</div>`;
window.customElements.define(
  "ob-setting-select",
  class extends HTMLElement {
    _button;
    _text;
    _context;
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot?.append(SelectTemplate.content.cloneNode(true));
      this._button = this.shadowRoot.querySelector('div[part="button"]');
      this._text = this.shadowRoot.querySelector('input[part="current-text"]');
      this._context = this.shadowRoot.querySelector('ul[part="option-list"]');
      const buttonClick = () => {
        const isHidden = this._context.classList.toggle("hidden");
        window[`${isHidden ? "remove" : "add"}EventListener`]("pointerdown", windowPointerDown);
      };
      const windowPointerDown = ({ target }) => {
        if (!this.contains(target)) buttonClick();
      };
      this._button.addEventListener("click", buttonClick);
      this._context.addEventListener("click", ({ target }) => {
        if (target.tagName !== "SETTING-OPTION") return;
        buttonClick();
        if (target.hasAttribute("is-selected")) return;
        this.querySelectorAll("setting-option[is-selected]").forEach((dom) => dom.toggleAttribute("is-selected"));
        target.toggleAttribute("is-selected");
        this._text.value = target.textContent;
        this.dispatchEvent(
          new CustomEvent("selected", {
            bubbles: true,
            composed: true,
            detail: {
              name: target.textContent,
              value: target.dataset.value
            }
          })
        );
      });
      this._text.value = this.querySelector("setting-option[is-selected]")?.textContent;
    }
  }
);
const SettingSelect = (items, configKey, configValue) => {
  return `<ob-setting-select ${`data-config-key="${configKey}"` }>
    ${items.map((e, i) => {
    return SettingOption(e.text, e.value, configValue ? configValue === e.value : i === 0);
  }).join("")}
</ob-setting-select>`;
};

class WebUiApiOB11ConfigWrapper {
  retCredential = "";
  async Init(Credential) {
    this.retCredential = Credential;
  }
  async GetOB11Config() {
    const ConfigResponse = await fetch("../api/OB11Config/GetConfig", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.retCredential,
        "Content-Type": "application/json"
      }
    });
    if (ConfigResponse.status == 200) {
      const ConfigResponseJson = await ConfigResponse.json();
      if (ConfigResponseJson.code == 0) {
        return ConfigResponseJson?.data;
      }
    }
    return {};
  }
  async SetOB11Config(config) {
    const ConfigResponse = await fetch("../api/OB11Config/SetConfig", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.retCredential,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ config: JSON.stringify(config) })
    });
    if (ConfigResponse.status == 200) {
      const ConfigResponseJson = await ConfigResponse.json();
      if (ConfigResponseJson.code == 0) {
        return true;
      }
    }
    return false;
  }
}
const OB11ConfigWrapper = new WebUiApiOB11ConfigWrapper();

async function onSettingWindowCreated(view) {
  const isEmpty = (value) => value === void 0 || value === void 0 || value === "";
  await OB11ConfigWrapper.Init(localStorage.getItem("auth"));
  const ob11Config = await OB11ConfigWrapper.GetOB11Config();
  const setOB11Config = (key, value) => {
    const configKey = key.split(".");
    if (configKey.length === 2) {
      ob11Config[configKey[1]] = value;
    } else if (configKey.length === 3) {
      ob11Config[configKey[1]][configKey[2]] = value;
    }
  };
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    [
      "<div>",
      `<setting-section id="napcat-error">
            <setting-panel><pre><code></code></pre></setting-panel>
        </setting-section>`,
      SettingList([
        SettingItem(
          '<span id="napcat-update-title">Napcat</span>',
          void 0,
          SettingButton("V1.8.6", "napcat-update-button", "secondary")
        )
      ]),
      SettingList([
        SettingItem(
          "启用 HTTP 服务",
          void 0,
          SettingSwitch("ob11.http.enable", ob11Config.http.enable, {
            "control-display-id": "config-ob11-http-port"
          })
        ),
        SettingItem(
          "HTTP 服务监听端口",
          void 0,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.http.port" type="number" min="1" max="65534" value="${ob11Config.http.port}" placeholder="${ob11Config.http.port}" /></div>`,
          "config-ob11-http-port",
          ob11Config.http.enable
        ),
        SettingItem(
          "启用 HTTP 心跳",
          void 0,
          SettingSwitch("ob11.http.enableHeart", ob11Config.http.enableHeart, {
            "control-display-id": "config-ob11-HTTP.enableHeart"
          })
        ),
        SettingItem(
          "启用 HTTP 事件上报",
          void 0,
          SettingSwitch("ob11.http.enablePost", ob11Config.http.enablePost, {
            "control-display-id": "config-ob11-http-postUrls"
          })
        ),
        `<div class="config-host-list" id="config-ob11-http-postUrls" ${ob11Config.http.enablePost ? "" : "is-hidden"}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>HTTP 事件上报密钥</setting-text>
                    </div>
                    <div class="q-input">
                        <input id="config-ob11-http-secret" class="q-input__inner" data-config-key="ob11.http.secret" type="text" value="${ob11Config.http.secret}" placeholder="未设置" />
                    </div>
                </setting-item>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>HTTP 事件上报地址</setting-text>
                    </div>
                    <setting-button id="config-ob11-http-postUrls-add" data-type="primary">添加</setting-button>
                </setting-item>
                <div id="config-ob11-http-postUrls-list"></div>
            </div>`,
        SettingItem(
          "启用正向 WebSocket 服务",
          void 0,
          SettingSwitch("ob11.ws.enable", ob11Config.ws.enable, {
            "control-display-id": "config-ob11-ws-port"
          })
        ),
        SettingItem(
          "正向 WebSocket 服务监听端口",
          void 0,
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.ws.port" type="number" min="1" max="65534" value="${ob11Config.ws.port}" placeholder="${ob11Config.ws.port}" /></div>`,
          "config-ob11-ws-port",
          ob11Config.ws.enable
        ),
        SettingItem(
          "启用反向 WebSocket 服务",
          void 0,
          SettingSwitch("ob11.reverseWs.enable", ob11Config.reverseWs.enable, {
            "control-display-id": "config-ob11-reverseWs-urls"
          })
        ),
        `<div class="config-host-list" id="config-ob11-reverseWs-urls" ${ob11Config.reverseWs.enable ? "" : "is-hidden"}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>反向 WebSocket 监听地址</setting-text>
                    </div>
                    <setting-button id="config-ob11-reverseWs-urls-add" data-type="primary">添加</setting-button>
                </setting-item>
                <div id="config-ob11-reverseWs-urls-list"></div>
            </div>`,
        SettingItem(
          " WebSocket 服务心跳间隔",
          "控制每隔多久发送一个心跳包，单位为毫秒",
          `<div class="q-input"><input class="q-input__inner" data-config-key="ob11.heartInterval" type="number" min="1000" value="${ob11Config.heartInterval}" placeholder="${ob11Config.heartInterval}" /></div>`
        ),
        SettingItem(
          "Access token",
          void 0,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="ob11.token" type="text" value="${ob11Config.token}" placeholder="未设置" /></div>`
        ),
        SettingItem(
          "新消息上报格式",
          `如客户端无特殊需求推荐保持默认设置，两者的详细差异可参考 <a href="javascript:LiteLoader.api.openExternal('https://github.com/botuniverse/onebot-11/tree/master/message#readme');">OneBot v11 文档</a>`,
          SettingSelect(
            [
              { text: "消息段", value: "array" },
              { text: "CQ码", value: "string" }
            ],
            "ob11.messagePostFormat",
            ob11Config.messagePostFormat
          )
        ),
        SettingItem(
          "音乐卡片签名地址",
          void 0,
          `<div class="q-input" style="width:210px;"><input class="q-input__inner" data-config-key="ob11.musicSignUrl" type="text" value="${ob11Config.musicSignUrl}" placeholder="未设置" /></div>`,
          "ob11.musicSignUrl"
        ),
        SettingItem(
          "启用本地进群时间与发言时间记录",
          void 0,
          SettingSwitch("ob11.GroupLocalTime.Record", ob11Config.GroupLocalTime.Record, {
            "control-display-id": "config-ob11-GroupLocalTime-RecordList"
          })
        ),
        `<div class="config-host-list" id="config-ob11-GroupLocalTime-RecordList" ${ob11Config.GroupLocalTime.Record ? "" : "is-hidden"}>
                <setting-item data-direction="row">
                    <div>
                        <setting-text>群列表</setting-text>
                    </div>
                    <setting-button id="config-ob11-GroupLocalTime-RecordList-add" data-type="primary">添加</setting-button>
                </setting-item>
                <div id="config-ob11-GroupLocalTime-RecordList-list"></div>
            </div>`,
        SettingItem(
          "",
          void 0,
          SettingButton("保存", "config-ob11-save", "primary")
        )
      ]),
      SettingList([
        SettingItem(
          "上报 Bot 自身发送的消息",
          "上报 event 为 message_sent",
          SettingSwitch("ob11.reportSelfMessage", ob11Config.reportSelfMessage)
        )
      ]),
      SettingList([
        SettingItem(
          "GitHub 仓库",
          "https://github.com/NapNeko/NapCatQQ",
          SettingButton("点个星星", "open-github")
        ),
        SettingItem("NapCat 文档", "", SettingButton("看看文档", "open-docs")),
        SettingItem(
          "Telegram 群",
          "https://t.me/+nLZEnpne-pQ1OWFl",
          SettingButton("进去逛逛", "open-telegram")
        ),
        SettingItem(
          "QQ 群",
          "545402644",
          SettingButton("我要进去", "open-qq-group")
        )
      ]),
      "</div>"
    ].join(""),
    "text/html"
  );
  doc.querySelector("#open-github")?.addEventListener("click", () => {
    window.open("https://github.com/NapNeko/NapCatQQ", "_blank");
  });
  doc.querySelector("#open-telegram")?.addEventListener("click", () => {
    window.open("https://t.me/+nLZEnpne-pQ1OWFl");
  });
  doc.querySelector("#open-qq-group")?.addEventListener("click", () => {
    window.open("https://qm.qq.com/q/bDnHRG38aI");
  });
  doc.querySelector("#open-docs")?.addEventListener("click", () => {
    window.open("https://napneko.github.io/", "_blank");
  });
  const buildHostListItem = (type, host, index, inputAttrs = {}) => {
    const dom = {
      container: document.createElement("setting-item"),
      input: document.createElement("input"),
      inputContainer: document.createElement("div"),
      deleteBtn: document.createElement("setting-button")
    };
    dom.container.classList.add("setting-host-list-item");
    dom.container.dataset.direction = "row";
    Object.assign(dom.input, inputAttrs);
    dom.input.classList.add("q-input__inner");
    dom.input.type = "url";
    dom.input.value = host;
    dom.input.addEventListener("input", () => {
      ob11Config[type.split("-")[0]][type.split("-")[1]][index] = dom.input.value;
    });
    dom.inputContainer.classList.add("q-input");
    dom.inputContainer.appendChild(dom.input);
    dom.deleteBtn.innerHTML = "删除";
    dom.deleteBtn.dataset.type = "secondary";
    dom.deleteBtn.addEventListener("click", () => {
      ob11Config[type.split("-")[0]][type.split("-")[1]].splice(index, 1);
      initReverseHost(type);
    });
    dom.container.appendChild(dom.inputContainer);
    dom.container.appendChild(dom.deleteBtn);
    return dom.container;
  };
  const buildHostList = (hosts, type, inputAttr = {}) => {
    const result = [];
    hosts?.forEach((host, index) => {
      result.push(buildHostListItem(type, host, index, inputAttr));
    });
    return result;
  };
  const addReverseHost = (type, doc2 = document, inputAttr = {}) => {
    type = type.replace(/\./g, "-");
    const hostContainerDom = doc2.body.querySelector(
      `#config-ob11-${type}-list`
    );
    hostContainerDom?.appendChild(
      buildHostListItem(
        type,
        "",
        ob11Config[type.split("-")[0]][type.split("-")[1]].length,
        inputAttr
      )
    );
    ob11Config[type.split("-")[0]][type.split("-")[1]].push("");
  };
  const initReverseHost = (type, doc2 = document) => {
    type = type.replace(/\./g, "-");
    const hostContainerDom = doc2.body?.querySelector(
      `#config-ob11-${type}-list`
    );
    if (hostContainerDom) {
      [...hostContainerDom.childNodes].forEach((dom) => dom.remove());
      buildHostList(
        ob11Config[type.split("-")[0]][type.split("-")[1]],
        type
      ).forEach((dom) => {
        hostContainerDom?.appendChild(dom);
      });
    }
  };
  initReverseHost("http.postUrls", doc);
  initReverseHost("reverseWs.urls", doc);
  initReverseHost("GroupLocalTime.RecordList", doc);
  doc.querySelector("#config-ob11-http-postUrls-add")?.addEventListener(
    "click",
    () => addReverseHost("http.postUrls", document, {
      placeholder: "如：http://127.0.0.1:5140/onebot"
    })
  );
  doc.querySelector("#config-ob11-reverseWs-urls-add")?.addEventListener(
    "click",
    () => addReverseHost("reverseWs.urls", document, {
      placeholder: "如：ws://127.0.0.1:5140/onebot"
    })
  );
  doc.querySelector("#config-ob11-GroupLocalTime-RecordList-add")?.addEventListener(
    "click",
    () => addReverseHost("GroupLocalTime.RecordList", document, {
      placeholder: "此处填写群号 -1为全部"
    })
  );
  doc.querySelector("#config-ffmpeg-select")?.addEventListener("click", () => {
  });
  doc.querySelector("#config-open-log-path")?.addEventListener("click", () => {
  });
  doc.querySelectorAll("setting-switch[data-config-key]").forEach((dom) => {
    dom.addEventListener("click", () => {
      const active = dom.getAttribute("is-active") == void 0;
      setOB11Config(dom.dataset.configKey, active);
      if (active) dom.setAttribute("is-active", "");
      else dom.removeAttribute("is-active");
      if (!isEmpty(dom.dataset.controlDisplayId)) {
        const displayDom = document.querySelector(
          //@ts-expect-error 等待修复
          `#${dom.dataset.controlDisplayId}`
        );
        if (active) displayDom?.removeAttribute("is-hidden");
        else displayDom?.setAttribute("is-hidden", "");
      }
    });
  });
  doc.querySelectorAll(
    "setting-item .q-input input.q-input__inner[data-config-key]"
  ).forEach((dom) => {
    dom.addEventListener("input", () => {
      const Type = dom.getAttribute("type");
      const configKey = dom.dataset.configKey;
      const configValue = Type === "number" ? parseInt(dom.value) >= 1 ? parseInt(dom.value) : 1 : dom.value;
      setOB11Config(configKey, configValue);
    });
  });
  doc.querySelectorAll("ob-setting-select[data-config-key]").forEach((dom) => {
    dom?.addEventListener("selected", (e) => {
      const configKey = dom.dataset.configKey;
      const configValue = e.detail.value;
      setOB11Config(configKey, configValue);
    });
  });
  doc.querySelector("#config-ob11-save")?.addEventListener("click", () => {
    OB11ConfigWrapper.SetOB11Config(ob11Config);
    alert("保存成功");
  });
  doc.body.childNodes.forEach((node) => {
    view.appendChild(node);
  });
}

export { onSettingWindowCreated };
