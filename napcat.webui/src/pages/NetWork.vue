<template>
    <t-space>
        <t-tabs v-model="value" theme="card" :addable="true" @add="addTab" @remove="removeTab">
            <t-tab-panel v-for="data in panelData" :key="data.value" :value="data.value" :label="data.label"
                :removable="data.removable">
                <component :is="data.component" :config="data.config" />
            </t-tab-panel>
        </t-tabs>
    </t-space>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { defaultOnebotConfig, mergeOnebotConfigs } from '../../../src/onebot/config/config';
import { QQLoginManager } from '../backend/shell';
import HttpServerComponent from './network/HttpServerComponent.vue';
import HttpClientComponent from './network/HttpClientComponent.vue';
import WebsocketServerComponent from './network/WebsocketServerComponent.vue';
import WebsocketClientComponent from './network/WebsocketClientComponent.vue';

let id = 0;
const value = ref('first');
const panelData = ref([]);

const componentMap = {
    'httpServers': HttpServerComponent,
    'httpClients': HttpClientComponent,
    'websocketServers': WebsocketServerComponent,
    'websocketClients': WebsocketClientComponent,
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

const loadConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        const mergedConfig = mergeOnebotConfigs(defaultOnebotConfig, userConfig);
        const networkConfig = mergedConfig.network;
        console.log('networkConfig:', networkConfig); // 添加日志输出
        const panels = [];

        Object.keys(networkConfig).forEach((key) => {
            networkConfig[key].forEach((config, index) => {
                const component = componentMap[key];
                if (!component) {
                    console.error(`No component found for key: ${key}`);
                    return;
                }
                panels.push({
                    value: `${key}-${index}`,
                    label: `${config.name}`,
                    component,
                    config,
                    removable: true,
                });
            });
        });

        console.log('panels:', panels); // 添加日志输出
        panelData.value = panels;
        if (panels.length > 0) {
            value.value = panels[0].value;
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

const addTab = () => {
    panelData.value.push({
        value: `new-${id}`,
        label: `新选项卡${id + 1}`,
        removable: true,
        component: null,
        config: {},
    });
    value.value = `new-${id}`;
    id += 1;
};

const removeTab = ({ value: val, index }) => {
    if (index < 0) return false;
    panelData.value.splice(index, 1);
    if (panelData.value.length === 0) return;
    if (value.value === val) {
        value.value = panelData.value[Math.max(index - 1, 0)].value;
    }
};

onMounted(() => {
    loadConfig();
});
</script>