<template>
    <t-space class="full-space">
        <t-tabs
            v-model="activeTab"
            :addable="true"
            theme="card"
            @add="showAddTabDialog"
            @remove="removeTab"
            class="full-tabs"
        >
            <t-tab-panel
                v-for="(config, idx) in clientPanelData"
                :key="idx"
                :label="config.name"
                :removable="true"
                :value="idx"
                class="full-tab-panel"
            >
                <component :is="resolveDynamicComponent(getComponent(config.key))" :config="config.data" />
                <div class="button-container">
                    <t-button @click="saveConfig" style="width: 100px; height: 40px">保存</t-button>
                </div>
            </t-tab-panel>
        </t-tabs>
        <t-dialog
            v-model:visible="isDialogVisible"
            header="添加新选项卡"
            @close="isDialogVisible = false"
            @confirm="addTab"
        >
            <t-form ref="form" :model="newTab">
                <t-form-item :rules="[{ required: true, message: '请输入名称' }]" label="名称" name="name">
                    <t-input v-model="newTab.name" />
                </t-form-item>
                <t-form-item :rules="[{ required: true, message: '请选择类型' }]" label="类型" name="type">
                    <t-select v-model="newTab.type">
                        <t-option value="httpServers">HTTP 服务器</t-option>
                        <t-option value="httpClients">HTTP 客户端</t-option>
                        <t-option value="websocketServers">WebSocket 服务器</t-option>
                        <t-option value="websocketClients">WebSocket 客户端</t-option>
                    </t-select>
                </t-form-item>
            </t-form>
        </t-dialog>
    </t-space>
</template>

<script setup lang="ts">
import { ref, resolveDynamicComponent, nextTick, Ref, onMounted, reactive, Reactive } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import {
    httpServerDefaultConfigs,
    httpClientDefaultConfigs,
    websocketServerDefaultConfigs,
    websocketClientDefaultConfigs,
    HttpClientConfig,
    HttpServerConfig,
    WebsocketClientConfig,
    WebsocketServerConfig,
    NetworkConfig,
    OneBotConfig,
    mergeOneBotConfigs,
} from '../../../../src/onebot/config/config';
import { QQLoginManager } from '@/backend/shell';
import HttpServerComponent from '@/pages/network/HttpServerComponent.vue';
import HttpClientComponent from '@/pages/network/HttpClientComponent.vue';
import WebsocketServerComponent from '@/pages/network/WebsocketServerComponent.vue';
import WebsocketClientComponent from '@/pages/network/WebsocketClientComponent.vue';

type ConfigKey = 'httpServers' | 'httpClients' | 'websocketServers' | 'websocketClients';

type ConfigUnion = HttpClientConfig | HttpServerConfig | WebsocketServerConfig | WebsocketClientConfig;

const defaultConfigs: Record<ConfigKey, ConfigUnion> = {
    httpServers: httpServerDefaultConfigs,
    httpClients: httpClientDefaultConfigs,
    websocketServers: websocketServerDefaultConfigs,
    websocketClients: websocketClientDefaultConfigs,
};

const componentMap: Record<
    ConfigKey,
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

interface ClientPanel {
    name: string;
    key: ConfigKey;
    data: Ref<ConfigUnion>;
}

type ComponentKey = keyof typeof componentMap;

// TODO: store these state in global store (aka pinia)
const activeTab = ref<number>(0);
const isDialogVisible = ref(false);
const newTab = ref<{ name: string; type: ComponentKey }>({ name: '', type: 'httpServers' });
const clientPanelData: Reactive<Array<ClientPanel>> = reactive([]);

const getComponent = (type: ComponentKey) => {
    return componentMap[type];
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

const addToPanel = <T extends ConfigUnion>(configs: T[], key: ConfigKey) => {
    configs.forEach((config) => clientPanelData.push({ name: config.name, data: config, key: key }));
};

const addConfigDataToPanel = (data: NetworkConfig) => {
    Object.entries(data).forEach(([key, configs]) => {
        if (key in defaultConfigs) {
            addToPanel(configs as ConfigUnion[], key as ConfigKey);
        }
    });
};

const parsePanelData = (): NetworkConfig => {
    return {
        websocketClients: clientPanelData
            .filter((panel) => panel.key === 'websocketClients')
            .map((panel) => panel.data as WebsocketClientConfig),
        websocketServers: clientPanelData
            .filter((panel) => panel.key === 'websocketServers')
            .map((panel) => panel.data as WebsocketServerConfig),
        httpClients: clientPanelData
            .filter((panel) => panel.key === 'httpClients')
            .map((panel) => panel.data as HttpClientConfig),
        httpServers: clientPanelData
            .filter((panel) => panel.key === 'httpServers')
            .map((panel) => panel.data as HttpServerConfig),
    };
};

const loadConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        if (!userConfig) return;
        const mergedConfig = mergeOneBotConfigs(userConfig);
        addConfigDataToPanel(mergedConfig.network);
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

// It's better to "saveConfig" instead of using deep watch
const saveConfig = async () => {
    const config = parsePanelData();
    const userConfig = await getOB11Config();
    if (!userConfig) return;
    userConfig.network = config;
    const success = await setOB11Config(userConfig);
    if (success) {
        MessagePlugin.success('配置保存成功');
    } else {
        MessagePlugin.error('配置保存失败');
    }
};

const showAddTabDialog = () => {
    newTab.value = { name: '', type: 'httpServers' };
    isDialogVisible.value = true;
};

const addTab = async () => {
    const { name, type } = newTab.value;
    if (clientPanelData.some((panel) => panel.name === name)) {
        MessagePlugin.error('选项卡名称已存在');
        return;
    }
    const defaultConfig = structuredClone(defaultConfigs[type]);
    defaultConfig.name = name;
    clientPanelData.push({ name, data: defaultConfig, key: type });
    isDialogVisible.value = false;
    await nextTick();
    activeTab.value = clientPanelData.length - 1;
    MessagePlugin.success('选项卡添加成功');
};

const removeTab = async (payload: { value: string; index: number; e: PointerEvent }) => {
    clientPanelData.splice(payload.index, 1);
    activeTab.value = Math.max(0, activeTab.value - 1);
    await saveConfig();
};

onMounted(() => {
    loadConfig();
});
</script>

<style scoped>
.full-space {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.full-tabs {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.full-tab-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
<style scoped>
.full-space {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.full-tabs {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.full-tab-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
