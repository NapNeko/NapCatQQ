<template>
    <t-space>
        <t-tabs v-model="value" theme="card" :addable="true" @add="showAddTabDialog" @remove="removeTab">
            <t-tab-panel v-for="data in panelData" :key="data.value" :value="data.value" :label="data.label"
                :removable="data.removable">
                <component :is="data.component" :config="data.config" />
            </t-tab-panel>
        </t-tabs>
    </t-space>
    <t-dialog :visible.sync="isDialogVisible" header="添加新选项卡" @confirm="addTab" @close="isDialogVisible = false">
        <t-form :model="newTab" ref="form">
            <t-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入名称' }]">
                <t-input v-model="newTab.name" />
            </t-form-item>
            <t-form-item label="类型" name="type" :rules="[{ required: true, message: '请选择类型' }]">
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

<script setup>
import { ref, shallowRef, onMounted, watch, nextTick } from 'vue';
import { defaultOnebotConfig, mergeOnebotConfigs } from '../../../src/onebot/config/config';
import { QQLoginManager } from '../backend/shell';
import HttpServerComponent from './network/HttpServerComponent.vue';
import HttpClientComponent from './network/HttpClientComponent.vue';
import WebsocketServerComponent from './network/WebsocketServerComponent.vue';
import WebsocketClientComponent from './network/WebsocketClientComponent.vue';

let id = 0;
const value = ref('first');
const panelData = ref([]);
const isDialogVisible = ref(false);
const newTab = ref({ name: '', type: '' });

const componentMap = {
    'httpServers': shallowRef(HttpServerComponent),
    'httpClients': shallowRef(HttpClientComponent),
    'websocketServers': shallowRef(WebsocketServerComponent),
    'websocketClients': shallowRef(WebsocketClientComponent),
};

const getOB11Config = async () => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return;
    }
    const loginManager = new QQLoginManager(storedCredential);
    const config = await loginManager.GetOB11Config();
    return config;
};

const setOB11Config = async (config) => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return false;
    }
    const loginManager = new QQLoginManager(storedCredential);
    const result = await loginManager.SetOB11Config(config);
    return result;
};

const log = (message, data) => {
    console.log(message, data);
};

const createPanel = (type, name, id) => {
    return {
        value: `${type}-${id}`,
        label: name,
        removable: true,
        component: componentMap[type],
        config: { name: name },
    };
};

const generatePanels = (networkConfig) => {
    const panels = [];
    Object.keys(networkConfig).forEach((key) => {
        networkConfig[key].forEach((config, index) => {
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

const removeTab = ({ value: val, index }) => {
    if (index < 0) return false;
    panelData.value.splice(index, 1);
    if (panelData.value.length === 0) return;
    if (value.value === val) {
        value.value = panelData.value[Math.max(index - 1, 0)].value;
    }
};

const syncConfig = async () => {
    const networkConfig = {};
    panelData.value.forEach(panel => {
        const key = panel.value.split('-')[0];
        if (!networkConfig[key]) {
            networkConfig[key] = [];
        }
        networkConfig[key].push(panel.config);
    });
    const userConfig = await getOB11Config();
    const mergedConfig = mergeOnebotConfigs(defaultOnebotConfig, userConfig);
    mergedConfig.network = networkConfig;
    await setOB11Config(mergedConfig);
};

watch(panelData, syncConfig, { deep: true });

onMounted(() => {
    loadConfig();
});
</script>