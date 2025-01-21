<template>
    <div>
        <t-form labelAlign="left">
            <t-form-item label="启用">
                <t-switch v-model="config.enable" />
            </t-form-item>
            <t-form-item label="端口">
                <t-input v-model.number="config.port" type="number" />
            </t-form-item>
            <t-form-item label="主机">
                <t-input v-model="config.host" type="text" />
            </t-form-item>
            <t-form-item label="报告自身消息">
                <t-switch v-model="config.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="启用 CORS">
                <t-switch v-model="config.enableCors" />
            </t-form-item>
            <t-form-item label="启用 WS">
                <t-switch v-model="config.enableWebsocket" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-select v-model="config.messagePostFormat" :options="messageFormatOptions" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="config.token" type="text" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-switch v-model="config.debug" />
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
    reportSelfMessage: false
};

const props = defineProps<{
    config: HttpSseServerConfig;
}>();

const config = ref(Object.assign({}, defaultConfig, props.config));

const messageFormatOptions = ref([
    { label: 'Array', value: 'array' },
    { label: 'String', value: 'string' },
]);

watch(
    () => config.value.messagePostFormat,
    (newValue) => {
        if (newValue !== 'array' && newValue !== 'string') {
            config.value.messagePostFormat = 'array';
        }
    }
);
</script>

<style scoped></style>