<template>
    <div>
        <t-form labelAlign="left">
            <t-form-item label="启用">
                <t-switch v-model="props.config.data.enable" />
            </t-form-item>
            <t-form-item label="主机">
                <t-input v-model="props.config.data.host" />
            </t-form-item>
            <t-form-item label="端口">
                <t-input v-model.number="props.config.data.port" type="number" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-select v-model="props.config.data.messagePostFormat" :options="messageFormatOptions" />
            </t-form-item>
            <t-form-item label="上报自身消息">
                <t-switch v-model="props.config.data.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="props.config.data.token" />
            </t-form-item>
            <t-form-item label="强制推送事件">
                <t-switch v-model="props.config.data.enableForcePushEvent" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-switch v-model="props.config.data.debug" />
            </t-form-item>
            <t-form-item label="心跳间隔">
                <t-input v-model.number="props.config.data.heartInterval" type="number" />
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { WebsocketServerConfig } from '../../../../src/onebot/config/config';

const defaultConfig: WebsocketServerConfig = {
    name: 'websocket-server',
    enable: false,
    host: '0.0.0.0',
    port: 3001,
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    enableForcePushEvent: true,
    debug: false,
    heartInterval: 30000,
};

const props = defineProps<{
    config: { data: WebsocketServerConfig };
}>();

props.config.data = { ...defaultConfig, ...props.config.data };

const messageFormatOptions = ref([
    { label: 'Array', value: 'array' },
    { label: 'String', value: 'string' },
]);

watch(
    () => props.config.data.messagePostFormat,
    (newValue) => {
        if (newValue !== 'array' && newValue !== 'string') {
            props.config.data.messagePostFormat = 'array';
        }
    }
);
</script>

<style scoped></style>
