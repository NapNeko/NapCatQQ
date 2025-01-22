<template>
    <div>
        <t-form labelAlign="left">
            <t-form-item label="启用">
                <t-switch v-model="props.config.data.enable" />
            </t-form-item>
            <t-form-item label="端口">
                <t-input v-model.number="props.config.data.port" type="number" />
            </t-form-item>
            <t-form-item label="主机">
                <t-input v-model="props.config.data.host" type="text" />
            </t-form-item>
            <t-form-item label="报告自身消息">
                <t-switch v-model="props.config.data.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="启用 CORS">
                <t-switch v-model="props.config.data.enableCors" />
            </t-form-item>
            <t-form-item label="启用 WS">
                <t-switch v-model="props.config.data.enableWebsocket" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-select v-model="props.config.data.messagePostFormat" :options="messageFormatOptions" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="props.config.data.token" type="text" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-switch v-model="props.config.data.debug" />
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { HttpSseServerConfig } from '../../../../src/onebot/config/config';

const defaultConfig: HttpSseServerConfig = {
    name: 'http-sse-server',
    enable: false,
    port: 3000,
    host: '0.0.0.0',
    enableCors: true,
    enableWebsocket: true,
    messagePostFormat: 'array',
    token: '',
    debug: false,
    reportSelfMessage: false,
};

const props = defineProps<{
    config: { data: HttpSseServerConfig };
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
