<template>
    <div>
        <h3>WebSocket Client 配置</h3>
        <t-form>
            <t-form-item label="URL">
                <t-input v-model="config.url" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-input v-model="config.messagePostFormat" />
            </t-form-item>
            <t-form-item label="报告自身消息">
                <t-checkbox v-model="config.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="config.token" />
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
import { ref } from 'vue';

interface WsClientConfig {
    url: string;
    messagePostFormat: string;
    reportSelfMessage: boolean;
    token: string;
    debug: boolean;
    heartInterval: number;
}

const config = ref<WsClientConfig>({
    url: '',
    messagePostFormat: '',
    reportSelfMessage: false,
    token: '',
    debug: false,
    heartInterval: 0,
});
</script>
