<template>
    <div>
        <t-form labelAlign="left">
            <t-form-item label="启用">
                <t-checkbox v-model="config.enable" />
            </t-form-item>
            <t-form-item label="主机">
                <t-input v-model="config.host" />
            </t-form-item>
            <t-form-item label="端口">
                <t-input v-model.number="config.port" type="number" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-select v-model="config.messagePostFormat" :options="messageFormatOptions" />
            </t-form-item>
            <t-form-item label="上报自身消息">
                <t-checkbox v-model="config.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="config.token" />
            </t-form-item>
            <t-form-item label="强制推送事件">
                <t-checkbox v-model="config.enableForcePushEvent" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-checkbox v-model="config.debug" />
            </t-form-item>
            <t-form-item label="心跳间隔">
                <t-input v-model.number="config.heartInterval" type="number" />
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { WebsocketServerConfig } from '../../../../src/onebot/config/config';

const props = defineProps<{
    config: WebsocketServerConfig;
}>();

const messageFormatOptions = ref([
    { label: 'Array', value: 'array' },
    { label: 'String', value: 'string' }
]);

watch(() => props.config.messagePostFormat, (newValue) => {
    if (newValue !== 'array' && newValue !== 'string') {
        props.config.messagePostFormat = 'array';
    }
});
</script>

<style scoped>
</style>
