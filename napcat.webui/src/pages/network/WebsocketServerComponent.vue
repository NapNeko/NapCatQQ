<template>
    <div class="container">
        <div class="form-container">
            <h3>WebSocket Server 配置</h3>
            <t-form>
                <t-form-item label="主机">
                    <t-input v-model="config.host" />
                </t-form-item>
                <t-form-item label="端口">
                    <t-input v-model.number="config.port" type="number" />
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
                <t-form-item label="启用推送事件">
                    <t-checkbox v-model="config.enablePushEvent" />
                </t-form-item>
                <t-form-item label="调试模式">
                    <t-checkbox v-model="config.debug" />
                </t-form-item>
                <t-form-item label="心跳间隔">
                    <t-input v-model.number="config.heartInterval" type="number" />
                </t-form-item>
            </t-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { WebsocketServerConfig } from '../../../../src/onebot/config/config';
defineProps<{
    config: WebsocketServerConfig;
}>();
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
}

.form-container {
    width: 100%;
    max-width: 600px;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
}
</style>