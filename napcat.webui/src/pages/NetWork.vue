<template>
    <t-space>
        <t-tabs v-model="value" :addable="true" theme="card" @add="showAddTabDialog" @remove="removeTab">
            <t-tab-panel
                v-for="data in panelData"
                :key="data.value"
                :label="data.label"
                :removable="data.removable"
                :value="data.value"
            >
                <component :is="data.component" :config="data.config" />
            </t-tab-panel>
        </t-tabs>
    </t-space>
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
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef, watch } from 'vue';
import { defaultOnebotConfig, mergeOnebotConfigs } from '../../../src/onebot/config/config';
import { QQLoginManager } from '@/backend/shell';
import HttpServerComponent from './network/HttpServerComponent.vue';
import HttpClientComponent from './network/HttpClientComponent.vue';
import WebsocketServerComponent from './network/WebsocketServerComponent.vue';
import WebsocketClientComponent from './network/WebsocketClientComponent.vue';

interface PanelData {
    value: string;
    label: string;
    removable: boolean;
    component: any;
    config: { name: string };
}

let id = 0;
const value = ref<string>('first');
const panelData = ref<PanelData[]>([]);
const isDialogVisible = ref<boolean>(false);
const newTab = ref<{ name: string; type: string }>({ name: '', type: '' });

const componentMap: Record<string, any> = {
    httpServers: shallowRef(HttpServerComponent),
    httpClients: shallowRef(HttpClientComponent),
    websocketServers: shallowRef(WebsocketServerComponent),
    websocketClients: shallowRef(WebsocketClientComponent),
};

const getOB11Config = async (): Promise<any | undefined> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.GetOB11Config();
};

const setOB11Config = async (config: any): Promise<boolean> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return false;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.SetOB11Config(config);
};

const log = (message: string, data: any) => {
    console.log(message, data);
};

const createPanel = (type: string, name: string, id: number): PanelData => {
    return {
        value: `${type}-${id}`,
        label: name,
        removable: true,
        component: componentMap[type],
        config: { name: name },
    };
};

const generatePanels = (networkConfig: any): PanelData[] => {
    const panels: PanelData[] = [];
    Object.keys(networkConfig).forEach((key) => {
        networkConfig[key].forEach((config: any, index: number) => {
            const component = componentMap[key];
            if (!component) {
                console.error(`No component found for key: ${key}`);
                return;
            }
            panels.push(createPanel(key, config.name, index));
        });
    });
    return panels;
};

const loadConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        if (!userConfig) return;
        const mergedConfig = mergeOnebotConfigs(defaultOnebotConfig, userConfig);
        const networkConfig = mergedConfig.network;
        log('networkConfig:', networkConfig);
        const panels = generatePanels(networkConfig);
        log('panels:', panels);
        panelData.value = panels;
        if (panels.length > 0) {
            value.value = panels[0].value;
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

const showAddTabDialog = () => {
    newTab.value = { name: '', type: '' };
    isDialogVisible.value = true;
};

const addTab = async () => {
    const { name, type } = newTab.value;
    if (!name || !type) return;
    const newPanel = createPanel(type, name, id);
    panelData.value.push(newPanel);
    id += 1;
    isDialogVisible.value = false;
    await nextTick(); // 确保 DOM 更新完成
    value.value = newPanel.value; // 强制重新渲染选项卡
};

const closeDialog = () => {
    isDialogVisible.value = false;
};

const removeTab = ({ value: val, index }: { value: string; index: number }) => {
    if (index < 0) return false;
    panelData.value.splice(index, 1);
    if (panelData.value.length === 0) return;
    if (value.value === val) {
        value.value = panelData.value[Math.max(index - 1, 0)].value;
    }
};

const syncConfig = async () => {
    const networkConfig: Record<string, any[]> = {};
    panelData.value.forEach((panel) => {
        const key = panel.value.split('-')[0];
        if (!networkConfig[key]) {
            networkConfig[key] = [];
        }
        networkConfig[key].push(panel.config);
    });
    const userConfig = await getOB11Config();
    if (!userConfig) return;
    const mergedConfig = mergeOnebotConfigs(defaultOnebotConfig, userConfig);
    mergedConfig.network = networkConfig;
    await setOB11Config(mergedConfig);
};

watch(panelData, syncConfig, { deep: true });

onMounted(() => {
    loadConfig();
});
</script>
