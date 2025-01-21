<template>
    <div ref="headerBox" class="title">
        <t-divider content="网络配置" align="left">
            <template #content>
                <div style="display: flex; justify-content: center; align-items: center">
                    <wifi1-icon />
                    <div style="margin-left: 5px">网络配置</div>
                </div>
            </template>
        </t-divider>
        <t-divider align="right">
            <t-button @click="addConfig()">
                <template #icon><add-icon /></template>
                添加配置</t-button>
        </t-divider>
    </div>
    <div v-if="loadPage" ref="setting" class="setting">
        <t-tabs ref="tabsRef" :style="{ width: tabsWidth + 'px' }" default-value="all" @change="selectType">
            <t-tab-panel value="all" label="全部"></t-tab-panel>
            <t-tab-panel value="httpServers" label="HTTP 服务器"></t-tab-panel>
            <t-tab-panel value="httpSseServers" label="HTTP SSE 服务器"></t-tab-panel>
            <t-tab-panel value="httpClients" label="HTTP 客户端"></t-tab-panel>
            <t-tab-panel value="websocketServers" label="WebSocket 服务器"></t-tab-panel>
            <t-tab-panel value="websocketClients" label="WebSocket 客户端"></t-tab-panel>

        </t-tabs>
    </div>
    <t-loading attach="#alice" :loading="!loadPage" :showOverlay="false">
        <div id="alice" v-if="!loadPage" style="height: 80vh;position: relative"></div>
    </t-loading>
    <div v-if="loadPage" class="card-box" :style="{ width: tabsWidth + 'px' }">
        <div class="setting-box" :style="{ maxHeight: cardHeight + 'px' }" v-if="cardConfig.length > 0">
            <div v-for="(item, index) in cardConfig" :key="index">
                <t-card :title="item.name" :description="item.type" :style="{ width: cardWidth + 'px' }"
                    :header-bordered="true" class="setting-card">
                    <template #actions>
                        <t-space>
                            <edit2-icon size="20px" @click="editConfig(item)"></edit2-icon>
                            <t-popconfirm content="确认删除" @confirm="delConfig(item)">
                                <delete-icon size="20px"></delete-icon>
                            </t-popconfirm>
                        </t-space>
                    </template>
                    <div class="setting-content">
                        <t-card class="card-address" :style="{
                            borderLeft:
                                '7px solid ' + (item.enable ? 'var(--td-success-color)' : 'var(--td-error-color)'),
                        }">
                            <div class="local-box" v-if="item.host && item.port">
                                <server-filled-icon class="local-icon" size="20px"
                                    @click="toggleProperty(item, 'enable')"></server-filled-icon>
                                <strong class="local">{{ item.host }}:{{ item.port }}</strong>
                                <copy-icon class="copy-icon" size="20px"
                                    @click="copyText(item.host + ':' + item.port)"></copy-icon>
                            </div>
                            <div class="local-box" v-if="item.url">
                                <server-filled-icon class="local-icon" size="20px"
                                    @click="toggleProperty(item, 'enable')"></server-filled-icon>
                                <strong class="local">{{ item.url }}</strong>
                                <copy-icon class="copy-icon" size="20px" @click="copyText(item.url)"></copy-icon>
                            </div>
                        </t-card>
                        <t-collapse :default-value="[0]" expand-mutex style="margin-top: 10px" class="info-coll">
                            <t-collapse-panel header="基础信息">
                                <t-descriptions size="small" :layout="infoOneCol ? 'vertical' : 'horizontal'"
                                    class="setting-base-info">
                                    <t-descriptions-item v-if="item.token" label="连接密钥">
                                        <div v-if="mediumScreen.matches || largeScreen.matches" class="token-view">
                                            <span>{{ showToken ? item.token : '******' }}</span>
                                            <browse-icon class="browse-icon" v-if="showToken" size="18px"
                                                @click="showToken = false"></browse-icon>
                                            <browse-off-icon class="browse-icon" v-else size="18px"
                                                @click="showToken = true"></browse-off-icon>
                                        </div>
                                        <div v-else>
                                            <t-popup :showArrow="true" trigger="click">
                                                <t-tag theme="primary">点击查看</t-tag>
                                                <template #content>
                                                    <div @click="copyText(item.token)">{{ item.token }}</div>
                                                </template>
                                            </t-popup>
                                        </div>
                                    </t-descriptions-item>
                                    <t-descriptions-item label="消息格式">{{
                                        item.messagePostFormat
                                    }}</t-descriptions-item>
                                </t-descriptions>
                            </t-collapse-panel>
                            <t-collapse-panel header="状态信息">
                                <t-descriptions size="small" :layout="infoOneCol ? 'vertical' : 'horizontal'"
                                    class="setting-base-info">
                                    <t-descriptions-item v-if="item.hasOwnProperty('debug')" label="调试日志">
                                        <t-tag :class="item.debug ? 'tag-item-on' : 'tag-item-off'"
                                            @click="toggleProperty(item, 'debug')">
                                            {{ item.debug ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableWebsocket')"
                                        label="Websocket 功能">
                                        <t-tag :class="item.enableWebsocket ? 'tag-item-on' : 'tag-item-off'"
                                            @click="toggleProperty(item, 'enableWebsocket')">
                                            {{ item.enableWebsocket ? '启用' : '禁用' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableCors')" label="跨域放行">
                                        <t-tag :class="item.enableCors ? 'tag-item-on' : 'tag-item-off'"
                                            @click="toggleProperty(item, 'enableCors')">
                                            {{ item.enableCors ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableForcePushEvent')"
                                        label="上报自身消息">
                                        <t-tag :class="item.reportSelfMessage ? 'tag-item-on' : 'tag-item-off'"
                                            @click="toggleProperty(item, 'reportSelfMessage')">
                                            {{ item.reportSelfMessage ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableForcePushEvent')"
                                        label="强制推送事件">
                                        <t-tag class="tag-item"
                                            :class="item.enableForcePushEvent ? 'tag-item-on' : 'tag-item-off'"
                                            @click="toggleProperty(item, 'enableForcePushEvent')">
                                            {{ item.enableForcePushEvent ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                </t-descriptions>
                            </t-collapse-panel>
                        </t-collapse>
                    </div>
                </t-card>
            </div>
            <div style="height: 20vh"></div>
        </div>
        <t-card v-else>
            <t-empty class="card-none" title="暂无网络配置"> </t-empty>
        </t-card>
    </div>
    <t-dialog v-model:visible="visibleBody" :header="dialogTitle" :destroy-on-close="true"
        :show-in-attached-element="true" :on-confirm="saveConfig" class=".t-dialog__ctx .t-dialog__position">
        <div slot="body" class="dialog-body">
            <t-form ref="form" :data="newTab" labelAlign="left" :model="newTab">
                <t-form-item style="text-align: left" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]"
                    label="名称" name="name">
                    <t-input v-model="newTab.name" />
                </t-form-item>
                <t-form-item style="text-align: left" :rules="[{ required: true, message: '请选择类型', trigger: 'change' }]"
                    label="类型" name="type">
                    <t-select v-model="newTab.type" @change="onloadDefault">
                        <t-option value="httpServers">HTTP 服务器</t-option>
                        <t-option value="httpSseServers">HTTP SSE 服务器</t-option>
                        <t-option value="httpClients">HTTP 客户端</t-option>
                        <t-option value="websocketServers">WebSocket 服务器</t-option>
                        <t-option value="websocketClients">WebSocket 客户端</t-option>
                    </t-select>
                </t-form-item>
                <div>
                    <component :is="resolveDynamicComponent(getComponent(newTab.type as ComponentKey))"
                        :config="newTab.data" />
                </div>
            </t-form>
        </div>
    </t-dialog>
</template>

<script setup lang="ts">
import {
    AddIcon,
    DeleteIcon,
    Edit2Icon,
    ServerFilledIcon,
    CopyIcon,
    BrowseOffIcon,
    BrowseIcon,
    Wifi1Icon,
} from 'tdesign-icons-vue-next';
import {
    loadConfig as loadConfigOnebot,
    NetworkAdapterConfig,
    NetworkConfigKey,
    OneBotConfig,
} from '../../../src/onebot/config/config';
import HttpServerComponent from '@/pages/network/HttpServerComponent.vue';
import HttpClientComponent from '@/pages/network/HttpClientComponent.vue';
import WebsocketServerComponent from '@/pages/network/WebsocketServerComponent.vue';
import WebsocketClientComponent from '@/pages/network/WebsocketClientComponent.vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { QQLoginManager } from '@/backend/shell';
import { onMounted, onUnmounted, ref, watch, resolveDynamicComponent } from 'vue';
import emitter from '@/ts/event-bus';
import HttpSseServerComponent from './network/HttpSseServerComponent.vue';

const showToken = ref<boolean>(false);
const infoOneCol = ref<boolean>(true);
const tabsWidth = ref<number>(0);
const menuWidth = ref<number>(0);
const cardWidth = ref<number>(0);
const cardHeight = ref<number>(0);
const mediumScreen = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
const largeScreen = window.matchMedia('(min-width: 1025px)');
const headerBox = ref<HTMLDivElement | null>(null);
const setting = ref<HTMLDivElement | null>(null);
const loadPage = ref<boolean>(false);
const visibleBody = ref<boolean>(false);
const newTab = ref<{ name: string; data: any; type: string }>({ name: '', data: {}, type: '' });
const dialogTitle = ref<string>('');

type ComponentKey = Exclude<NetworkConfigKey, 'plugins'>
const componentMap: Record<
    ComponentKey,
    | typeof HttpServerComponent
    | typeof HttpClientComponent
    | typeof WebsocketServerComponent
    | typeof WebsocketClientComponent
    | typeof HttpSseServerComponent
> = {
    httpServers: HttpServerComponent,
    httpSseServers: HttpSseServerComponent,
    httpClients: HttpClientComponent,
    websocketServers: WebsocketServerComponent,
    websocketClients: WebsocketClientComponent,
};

//操作类型
const operateType = ref<string>('');
//配置项索引
const configIndex = ref<number>(0);
//保存时所用数据
const networkConfig: { [key: string]: any } = {
    websocketClients: [],
    websocketServers: [],
    httpSseServers: [],
    httpClients: [],
    httpServers: [],
};

//挂载的数据
const WebConfg = ref(
    new Map<string, Array<null>>([
        ['all', []],
        ['httpServers', []],
        ['httpClients', []],
        ['httpSseServers', []],
        ['websocketServers', []],
        ['websocketClients', []],
    ])
);
const typeCh: Record<ComponentKey, string> = {
    httpServers: 'HTTP 服务器',
    httpClients: 'HTTP 客户端',
    httpSseServers: 'HTTP SSE 服务器',
    websocketServers: 'WebSocket 服务器',
    websocketClients: 'WebSocket 客户端',
};
const cardConfig = ref<any>([]);
const getComponent = (type: ComponentKey) => {
    return componentMap[type];
};
const getKeyByValue = (obj: typeof typeCh, value: string): string | undefined => {
    return Object.entries(obj).find(([_, v]) => v === value)?.[0];
};

const addConfig = () => {
    dialogTitle.value = '添加配置';
    newTab.value = { name: '', data: {}, type: '' };
    operateType.value = 'add';
    visibleBody.value = true;
};

const editConfig = (item: any) => {
    dialogTitle.value = '编辑配置';
    newTab.value = { name: item.name, data: { ...item }, type: getKeyByValue(typeCh, item.type) || '' };
    operateType.value = 'edit';
    visibleBody.value = true;
};

const toggleProperty = async (item: any, tagData: string) => {
    const type = getKeyByValue(typeCh, item.type);
    const newData = { ...item };
    newData[tagData] = !item[tagData];
    if (type) {
        newTab.value = { name: item.name, data: newData, type: type };
    }
    operateType.value = 'edit';
    configIndex.value = networkConfig[newTab.value.type].findIndex((obj: any) => obj.name === item.name);
    await saveConfig();
};

const delConfig = (item: any) => {
    const type = getKeyByValue(typeCh, item.type);
    if (type) {
        newTab.value = { name: item.name, data: item, type: type };
    }
    configIndex.value = configIndex.value = networkConfig[newTab.value.type].findIndex(
        (obj: any) => obj.name === item.name
    );
    operateType.value = 'delete';
    saveConfig();
};

const selectType = (key: ComponentKey) => {
    console.log(WebConfg.value, key, WebConfg.value.get(key));
    cardConfig.value = WebConfg.value.get(key) || [];
};

const onloadDefault = (key: ComponentKey) => {
    newTab.value.data = {};
};
//检测重名
const checkName = (name: string) => {
    const allConfigs = WebConfg.value.get('all')?.findIndex((obj: any) => obj.name === name);
    if (newTab.value.name === '' || newTab.value.type === '') {
        MessagePlugin.error('请填写完整信息');
        return false;
    } else if (allConfigs === -1 || newTab.value.data.name === name) {
        return true;
    } else {
        MessagePlugin.error('名称已存在');
        return false;
    }
};
//保存
const saveConfig = async () => {
    if (operateType.value == 'add') {
        if (!checkName(newTab.value.name)) return;
        newTab.value.data.name = newTab.value.name;
        networkConfig[newTab.value.type].push(newTab.value.data);
    } else if (operateType.value == 'edit') {
        if (!checkName(newTab.value.name)) return;
        newTab.value.data.name = newTab.value.name;
        networkConfig[newTab.value.type][configIndex.value] = newTab.value.data;
    } else if (operateType.value == 'delete') {
        networkConfig[newTab.value.type].splice(configIndex.value, 1);
    }
    const userConfig = await getOB11Config();
    if (!userConfig) return;
    userConfig.network = networkConfig as any;
    const success = await setOB11Config(userConfig);
    if (success) {
        operateType.value = '';
        configIndex.value = 0;
        MessagePlugin.success('配置保存成功');
        await loadConfig();
        visibleBody.value = false;
    } else {
        MessagePlugin.error('配置保存失败');
    }
};
const getOB11Config = async (): Promise<OneBotConfig | undefined> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.GetOB11Config();
};

const setOB11Config = async (config: OneBotConfig): Promise<boolean> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return false;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.SetOB11Config(config);
};

//获取卡片数据
const getAllData = (data: { [key: string]: Array<NetworkAdapterConfig> }) => {
    cardConfig.value = [];
    WebConfg.value.set('all', []);
    for (const key in data) {
        const configs = data[key as keyof NetworkAdapterConfig];
        if (key in networkConfig) {
            networkConfig[key] = [...configs];
            const newConfigsArray = configs.map((config: any) => ({
                ...config,
                type: typeCh[key as ComponentKey],
            }));
            WebConfg.value.set(key, newConfigsArray);
            const allConfigs = WebConfg.value.get('all');
            if (allConfigs) {
                const newAllConfigs = [...allConfigs, ...newConfigsArray];
                WebConfg.value.set('all', newAllConfigs);
            }
            cardConfig.value = WebConfg.value.get('all');
        }
    }
};

const loadConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        if (!userConfig) return;
        const mergedConfig = loadConfigOnebot(userConfig);
        getAllData(mergedConfig.network);
    } catch (error) {
        console.error('Error loading config:', error);
    }
};
const copyText = async (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        MessagePlugin.success('复制成功');
    } catch (err) {
        console.error('复制失败', err);
    } finally {
        document.body.removeChild(textarea);
    }
};

const handleResize = () => {
    tabsWidth.value = window.innerWidth - 41 - menuWidth.value;
    if (mediumScreen.matches) {
        cardWidth.value = (tabsWidth.value - 20) / 2;
    } else if (largeScreen.matches) {
        cardWidth.value = (tabsWidth.value - 40) / 3;
    } else {
        cardWidth.value = tabsWidth.value;
    }
    loadPage.value = true;
    setTimeout(() => {
        cardHeight.value = window.innerHeight - (headerBox.value?.offsetHeight ?? 0) - (setting.value?.offsetHeight ?? 0) - 21;
    }, 300)
};
emitter.on('sendWidth', (width) => {
    if (typeof width === 'string') {
        const strWidth = width as string;
        menuWidth.value = parseInt(strWidth);
    }
});
watch(menuWidth, (newValue, oldValue) => {
    loadPage.value = false;
    setTimeout(() => {
        handleResize();
    }, 300)
});
onMounted(() => {
    loadConfig();
    const cachedWidth = localStorage.getItem('menuWidth');
    if (cachedWidth) {
        menuWidth.value = parseInt(cachedWidth);
        setTimeout(() => {
            handleResize();
        }, 300)
    }
    window.addEventListener('resize', () => {
        setTimeout(() => {
            handleResize();
        }, 300)
    });
});
onUnmounted(() => {
    window.removeEventListener('resize', () => {
        setTimeout(() => {
            handleResize();
        }, 300)
    });
});
</script>

<style scoped>
.title {
    padding: 20px 20px 0 20px;
    display: flex;
    justify-content: space-between;
}

.setting {
    margin: 0 20px;
}

.setting-box {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    overflow-y: auto;
}

.setting-card {
    width: 100%;
    text-align: left;
}

.setting-content {
    width: 100%;
}

.card-address svg {
    fill: var(--td-brand-color);
    cursor: pointer;
}

.local-box {
    display: flex;
    margin-top: 2px;
}

.local-icon {
    flex: 1;
}

.local {
    flex: 6;
    margin: 0 10px 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.copy-icon {
    flex: 1;
    cursor: pointer;
    flex-direction: row;
}

.token-view {
    display: flex;
    align-items: center;
}

.token-view span {
    flex: 5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tag-item-on {
    color: white;
    cursor: pointer;
    background-image: linear-gradient(to top, #0ba360 0%, #3cba92 100%) !important;
}

.tag-item-off {
    color: white;
    cursor: pointer;
    background-image: linear-gradient(to top, rgba(255, 8, 68, 0.93) 0%, #D54941 100%) !important;
}

.browse-icon {
    flex: 2;
}

:global(.t-dialog__ctx .t-dialog__position) {
    padding: 48px 10px;
}

@media (max-width: 1024px) {
    .setting-box {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 786px) {
    .setting-box {
        grid-template-columns: 1fr;
    }
}

.card-box {
    margin: 10px 20px 0 20px;
}

.card-none {
    line-height: 400px !important;
}

.dialog-body {
    max-height: 50vh;
    overflow-y: auto;
}

::-webkit-scrollbar {
    width: 0;
    background: transparent;
}
</style>
<style>
.setting-card .t-card__title {
    text-align: left !important;
}

.setting-card .t-card__description {
    margin-bottom: 0;
    font-size: 12px;
}

.setting-base-info .t-descriptions__header {
    font-size: 15px;
    margin-bottom: 0;
}

.setting-base-info .t-descriptions__label {
    padding: 0 var(--td-comp-paddingLR-l) !important;
}

.setting-base-info tr>td:last-child {
    text-align: right;
}

.info-coll .t-collapse-panel__wrapper .t-collapse-panel__content {
    padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
}
</style>
