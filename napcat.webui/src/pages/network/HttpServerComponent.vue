<template>
    <div>
        <h3>HTTP Server 配置</h3>
        <t-form>
            <t-form-item label="端口">
                <t-input v-model.number="config.port" type="number" />
            </t-form-item>
            <t-form-item label="主机">
                <t-input v-model="config.host" type="text" />
            </t-form-item>
            <t-form-item label="启用 CORS">
                <t-checkbox v-model="config.enableCors" />
            </t-form-item>
            <t-form-item label="启用 WebSocket">
                <t-checkbox v-model="config.enableWebsocket" />
            </t-form-item>
            <t-form-item label="消息格式">
                <t-input v-model="config.messagePostFormat" type="text" />
            </t-form-item>
            <t-form-item label="报告自身消息">
                <t-checkbox v-model="config.reportSelfMessage" />
            </t-form-item>
            <t-form-item label="Token">
                <t-input v-model="config.token" type="text" />
            </t-form-item>
            <t-form-item label="调试模式">
                <t-checkbox v-model="config.debug" />
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { HttpServerConfig } from '../../../../src/onebot/config/config';
defineProps<{
    config: HttpServerConfig;
}>();
</script>
