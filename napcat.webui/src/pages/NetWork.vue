<template>
    <div ref="headerBox" class="title">
        <t-divider content="网络配置" align="left" />
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
            <t-tab-panel value="httpClients" label="HTTP 客户端"></t-tab-panel>
            <t-tab-panel value="websocketServers" label="WebSocket 服务器"></t-tab-panel>
            <t-tab-panel value="websocketClients" label="WebSocket 客户端"></t-tab-panel>
        </t-tabs>
    </div>
    <div v-if="loadPage" class="card-box" :style="{ width: tabsWidth + 'px' }">
        <div class="setting-box" :style="{ maxHeight: cardHeight + 'px' }" v-if="cardConfig.length > 0">
            <div v-for="(item, index) in cardConfig" :key="index">
                <t-card :title="item.name" :description="item.type" :style="{ width: cardWidth + 'px' }"
                    :header-bordered="true" class="setting-card">
                    <template #actions>
                        <t-space>
                            <edit2-icon size="20px" @click="editConfig(item)"></edit2-icon>
                            <t-popconfirm theme="danger" content="确认删除" @confirm="delConfig(item)">
                                <delete-icon size="20px"></delete-icon>
                            </t-popconfirm>
                        </t-space>
                    </template>
                    <div class="setting-content">
                        <t-card class="card-address" :style="{
                            borderLeft: '7px solid ' + (item.enable ?
                                'var(--td-success-color)' :
                                'var(--td-error-color)')
                        }">
                            <server-filled-icon size="20px"></server-filled-icon>
                            <strong v-if="item.host">{{ item.host }}</strong>
                            <strong v-if="item.url">{{ item.url }}</strong>
                            <strong v-if="item.port">:{{ item.port }}</strong>
                            <div style="flex: 1"></div>
                            <copy-icon size="20px" @click="copyText(item.host + ':' + item.port)"></copy-icon>
                        </t-card>
                        <t-collapse :default-value="[0]" expand-mutex style="margin-top:10px;" class="info-coll">
                            <t-collapse-panel header="基础信息">
                                <t-descriptions size="small" :layout="infoOneCol ? 'vertical' : 'horizontal'"
                                    class="setting-base-info">
                                    <t-descriptions-item v-if="item.token" label="连接密钥">
                                        <div class="token-view">
                                            <span>{{ showToken ? item.token : '*******' }}</span>
                                            <browse-icon v-if="showToken" size="15px"
                                                @click="showToken = false"></browse-icon>
                                            <browse-off-icon v-else size="17px"
                                                @click="showToken = true"></browse-off-icon>
                                        </div>
                                    </t-descriptions-item>
                                    <t-descriptions-item label="消息格式">{{ item.messagePostFormat }}</t-descriptions-item>
                                </t-descriptions>
                            </t-collapse-panel>
                            <t-collapse-panel header="状态信息">
                                <t-descriptions size="small" :layout="infoOneCol ? 'vertical' : 'horizontal'"
                                    class="setting-base-info">
                                    <t-descriptions-item v-if="item.token" label="调试日志">
                                        <t-tag class="tag-item" :theme="item.debug ? 'success' : 'danger'">
                                            {{ item.debug ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableWebsocket')"
                                        label="Websocket 功能">
                                        <t-tag class="tag-item" :theme="item.enableWebsocket ? 'success' : 'danger'">
                                            {{ item.enableWebsocket ? '启用' : '禁用' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableCors')" label="跨域放行">
                                        <t-tag class="tag-item" :theme="item.enableCors ? 'success' : 'danger'">
                                            {{ item.enableCors ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableForcePushEvent')"
                                        label="上报自身消息">
                                        <t-tag class="tag-item" :theme="item.reportSelfMessage ? 'success' : 'danger'">
                                            {{ item.reportSelfMessage ? '开启' : '关闭' }}</t-tag>
                                    </t-descriptions-item>
                                    <t-descriptions-item v-if="item.hasOwnProperty('enableForcePushEvent')"
                                        label="强制推送事件">
                                        <t-tag class="tag-item"
                                            :theme="item.enableForcePushEvent ? 'success' : 'danger'">
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
        <t-card class="card-none" v-else>
            <div class="card-noneText">暂无网络配置</div>
        </t-card>
    </div>
    <t-dialog v-model:visible="visibleBody" :header="dialogTitle" :destroy-on-close="true"
        :show-in-attached-element="true" placement="center" :on-confirm="saveConfig">
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
import { AddIcon, DeleteIcon, Edit2Icon, ServerFilledIcon, CopyIcon, BrowseOffIcon, BrowseIcon } from 'tdesign-icons-vue-next';
import { onMounted, onUnmounted, ref, resolveDynamicComponent } from 'vue';
import emitter from '@/ts/event-bus';
import {
    mergeNetworkDefaultConfig,
    mergeOneBotConfigs,
    NetworkConfig,
    OneBotConfig,
} from '../../../src/onebot/config/config';
import HttpServerComponent from '@/pages/network/HttpServerComponent.vue';
import HttpClientComponent from '@/pages/network/HttpClientComponent.vue';
import WebsocketServerComponent from '@/pages/network/WebsocketServerComponent.vue';
import WebsocketClientComponent from '@/pages/network/WebsocketClientComponent.vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { QQLoginManager } from '@/backend/shell';

const showToken = ref<boolean>(false);
const infoOneCol = ref<boolean>(true);
const tabsWidth = ref<number>(0);
const menuWidth = ref<number>(0);
const cardWidth = ref<number>(0);
const cardHeight = ref<number>(0);
const mediumScreen = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
const largeScreen = window.matchMedia('(min-width: 1025px)');
const headerBox = ref<any>(null);
const setting = ref<any>(null);
const loadPage = ref<boolean>(false);
const visibleBody = ref<boolean>(false);
const newTab = ref<{ name: string; data: any; type: string }>({ name: '', data: {}, type: '' });
const dialogTitle = ref<string>('');

type ComponentKey = keyof typeof mergeNetworkDefaultConfig;

const componentMap: Record<
    ComponentKey,
    | typeof HttpServerComponent
    | typeof HttpClientComponent
    | typeof WebsocketServerComponent
    | typeof WebsocketClientComponent
> = {
    httpServers: HttpServerComponent,
    httpClients: HttpClientComponent,
    websocketServers: WebsocketServerComponent,
    websocketClients: WebsocketClientComponent,
};

//操作类型
const operateType = ref<string>('');
//配置项索引
const configIndex = ref<number>(0);
//保存时所用数据
interface NetworkConfigType {
    [key: string]: any;
    websocketClients: any[];
    websocketServers: any[];
    httpClients: any[];
    httpServers: any[];
}
const networkConfig: NetworkConfigType = {
    websocketClients: [],
    websocketServers: [],
    httpClients: [],
    httpServers: [],
};

//挂载的数据
const WebConfg = ref(
    new Map<string, Array<null>>([
        ['all', []],
        ['httpServers', []],
        ['httpClients', []],
        ['websocketServers', []],
        ['websocketClients', []],
    ])
);
interface TypeChType {
    [key: string]: string;
    httpServers: string;
    httpClients: string;
    websocketServers: string;
    websocketClients: string;
}
const typeCh: Record<ComponentKey, string> = {
    httpServers: 'HTTP 服务器',
    httpClients: 'HTTP 客户端',
    websocketServers: 'WebSocket 服务器',
    websocketClients: 'WebSocket 客户端',
};
const getKeyByValue = (obj: TypeChType, value: string): string | undefined => {
    return Object.entries(obj).find(([_, v]) => v === value)?.[0];
};
const cardConfig = ref<any>([]);
const getComponent = (type: ComponentKey) => {
    return componentMap[type];
};

const addConfig = () => {
    dialogTitle.value = '添加配置';
    newTab.value = { name: '', data: {}, type: '' };
    operateType.value = 'add';
    visibleBody.value = true;
};

const editConfig = (item: any) => {
    dialogTitle.value = '修改配置';
    const type = getKeyByValue(typeCh, item.type);
    if (type) {
        newTab.value = { name: item.name, data: item, type: type };
    }
    operateType.value = 'edit';
    configIndex.value = networkConfig[newTab.value.type].findIndex((obj: any) => obj.name === item.name);
    visibleBody.value = true;
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
    cardConfig.value = WebConfg.value.get(key);
};

const onloadDefault = (key: ComponentKey) => {
    console.log(key);
    newTab.value.data = structuredClone(mergeNetworkDefaultConfig[key]);
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
    userConfig.network = networkConfig;
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
const getAllData = (data: NetworkConfig) => {
    cardConfig.value = [];
    WebConfg.value.set('all', []);
    for (const key in data) {
        const configs = data[key as keyof NetworkConfig];
        if (key in mergeNetworkDefaultConfig) {
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
        const mergedConfig = mergeOneBotConfigs(userConfig);
        getAllData(mergedConfig.network);
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

const copyText = async (text: string) => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    await navigator.clipboard.writeText(text);
    document.body.removeChild(input);
    MessagePlugin.success('复制成功');
};

const handleResize = () => {
    // 得根据卡片宽度改，懒得改了；先不管了
    // if(window.innerWidth < 540) {
    //     infoOneCol.value= true
    // } else {
    //     infoOneCol.value= false
    // }
    tabsWidth.value = window.innerWidth - 40 - menuWidth.value;
    if (mediumScreen.matches) {
        cardWidth.value = (tabsWidth.value - 20) / 2;
    } else if (largeScreen.matches) {
        cardWidth.value = (tabsWidth.value - 40) / 3;
    } else {
        cardWidth.value = tabsWidth.value;
    }
    loadPage.value = true;
    setTimeout(() => {
        cardHeight.value = window.innerHeight - headerBox.value.offsetHeight - setting.value.offsetHeight - 20;
    }, 300);
};
emitter.on('sendWidth', (width) => {
    if (typeof width === 'number' && !isNaN(width)) {
        menuWidth.value = width;
        handleResize();
    }
});
onMounted(() => {
    loadConfig();
    const cachedWidth = localStorage.getItem('menuWidth');
    if (cachedWidth) {
        menuWidth.value = parseInt(cachedWidth);
        setTimeout(() => {
            handleResize();
        }, 300);
    }
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
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
}

.setting-content {
    width: 100%;
    text-align: left;
}

.card-address svg {
    fill: var(--td-brand-color);
    margin-right: 10px;
    cursor: pointer;
}

.setting-address {
    display: flex;
    margin-top: 2px;
}

.local {
    flex: 5.5;
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.none-box {
    flex: 0.5;
}

.port {
    flex: 4;
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.setting-status {
    display: flex;
    margin-top: 2px;
}

.status-deBug {
    display: flex;
    flex: 4;
}

.status-tag {
    display: flex;
    flex: 5.5;
}

.token-view {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.token-view span {
    flex: 1;
    margin-right: 20%;
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

    .setting-address {
        display: block;
    }
}

.card-box {
    margin: 10px 20px 0 20px;
}

.card-none {
    line-height: 200px;
}

.card-noneText {
    font-size: 16px;
}

.dialog-body {
    max-height: 60vh;
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

.card-address .t-card__body {
    display: flex;
    flex-direction: row;
    align-items: center;
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
