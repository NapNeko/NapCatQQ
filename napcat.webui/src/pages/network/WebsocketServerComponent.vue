<template>
    <div class="container">
        <div class="form-container">
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
                <t-form-item label="启用 WS">
                    <t-checkbox v-model="config.enableWebsocket" />
                </t-form-item>
                <t-form-item label="消息格式">
                    <t-input v-model="config.messagePostFormat" type="text" />
                </t-form-item>
                <t-form-item label="Token">
                    <t-input v-model="config.token" type="text" />
                </t-form-item>
                <t-form-item label="调试模式">
                    <t-checkbox v-model="config.debug" />
                </t-form-item>
                <t-form-item label="启用">
                    <t-checkbox v-model="config.enable" />
                </t-form-item>
            </t-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { HttpServerConfig } from '../../../../src/onebot/config/config';
defineProps<{
    config: HttpServerConfig;
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