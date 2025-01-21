<template>
    <div>
        <t-form labelAlign="left">
            <t-form-item label="启用">
                <t-switch v-model="props.config.data.enable" />
            </t-form-item>
            <t-form-item label="URL">
                <t-input v-model="props.config.data.url" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-select v-model="props.config.data.messagePostFormat" :options="messageFormatOptions" />
            </t-form-item>
            <t-form-item label="报告自身消息">
                <t-switch v-model="props.config.data.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="props.config.data.token" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-switch v-model="props.config.data.debug" />
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { HttpClientConfig } from '../../../../src/onebot/config/config';

const defaultConfig: HttpClientConfig = {
    name: 'http-client',
    enable: false,
    url: 'http://localhost:8080',
    messagePostFormat: 'array',
    reportSelfMessage: false,
    token: '',
    debug: false,
};

const props = defineProps<{
    config: { data: HttpClientConfig };
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
