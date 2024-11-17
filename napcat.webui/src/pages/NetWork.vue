<template>
    <t-space class="full-space">
        <template v-if="clientPanelData.length > 0">
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
        </template>
        <template v-else>
            <EmptyStateComponent :showAddTabDialog="showAddTabDialog" />
        </template>
        <t-dialog
            v-model:visible="isDialogVisible"
            header="添加网络配置"
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
import { ref, resolveDynamicComponent, nextTick, Ref, onMounted } from 'vue';
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
} from '../../../src/onebot/config/config';
import { QQLoginManager } from '@/backend/shell';
import HttpServerComponent from '@/pages/network/HttpServerComponent.vue';
import HttpClientComponent from '@/pages/network/HttpClientComponent.vue';
import WebsocketServerComponent from '@/pages/network/WebsocketServerComponent.vue';
import WebsocketClientComponent from '@/pages/network/WebsocketClientComponent.vue';
import EmptyStateComponent from '@/pages/network/EmptyStateComponent.vue';

type ConfigKey = 'httpServers' | 'httpClients' | 'websocketServers' | 'websocketClients';
type ConfigUnion = HttpClientConfig | HttpServerConfig | WebsocketServerConfig | WebsocketClientConfig;
type ComponentUnion =
    | typeof HttpServerComponent
    | typeof HttpClientComponent
    | typeof WebsocketServerComponent
    | typeof WebsocketClientComponent;

const componentMap: Record<ConfigKey, ComponentUnion> = {
    httpServers: HttpServerComponent,
    httpClients: HttpClientComponent,
    websocketServers: WebsocketServerComponent,
    websocketClients: WebsocketClientComponent,
};

const defaultConfigMap: Record<ConfigKey, ConfigUnion> = {
    httpServers: httpServerDefaultConfigs,
    httpClients: httpClientDefaultConfigs,
    websocketServers: websocketServerDefaultConfigs,
    websocketClients: websocketClientDefaultConfigs,
};

interface ConfigMap {
    httpServers: HttpServerConfig;
    httpClients: HttpClientConfig;
    websocketServers: WebsocketServerConfig;
    websocketClients: WebsocketClientConfig;
}

interface ClientPanel<K extends ConfigKey = ConfigKey> {
    name: string;
    key: K;
    data: ConfigMap[K];
}

const activeTab = ref<number>(0);
const isDialogVisible = ref(false);
const newTab = ref<{ name: string; type: ConfigKey }>({ name: '', type: 'httpServers' });
const clientPanelData: Ref<ClientPanel[]> = ref([]);

const getComponent = (type: ConfigKey) => {
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

const addToPanel = <K extends ConfigKey>(configs: ConfigMap[K][], key: K) => {
    configs.forEach((config) => clientPanelData.value.push({ name: config.name, data: config, key }));
};

const addConfigDataToPanel = (data: NetworkConfig) => {
    (Object.keys(data) as ConfigKey[]).forEach((key) => {
        addToPanel(data[key], key);
    });
};

const parsePanelData = (): NetworkConfig => {
    const result: NetworkConfig = {
        httpServers: [],
        httpClients: [],
        websocketServers: [],
        websocketClients: [],
    };
    clientPanelData.value.forEach((panel) => {
        (result[panel.key] as Array<typeof panel.data>).push(panel.data);
    });
    return result;
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

const saveConfig = async () => {
    const config = parsePanelData();
    const userConfig = await getOB11Config();
    if (!userConfig) {
        await MessagePlugin.error('无法获取配置！');
        return;
    }
    userConfig.network = config;
    const success = await setOB11Config(userConfig);
    if (success) {
        await MessagePlugin.success('配置保存成功');
    } else {
        await MessagePlugin.error('配置保存失败');
    }
};

const showAddTabDialog = () => {
    newTab.value = { name: '', type: 'httpServers' };
    isDialogVisible.value = true;
};

const addTab = async () => {
    const { name, type } = newTab.value;
    if (clientPanelData.value.some((panel) => panel.name === name)) {
        await MessagePlugin.error('选项卡名称已存在');
        return;
    }
    const defaultConfig = structuredClone(defaultConfigMap[type]);
    defaultConfig.name = name;
    clientPanelData.value.push({ name, data: defaultConfig, key: type });
    isDialogVisible.value = false;
    await nextTick();
    activeTab.value = clientPanelData.value.length - 1;
    await MessagePlugin.success('选项卡添加成功');
};

const removeTab = async (payload: { value: string; index: number; e: PointerEvent }) => {
    clientPanelData.value.splice(payload.index, 1);
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
