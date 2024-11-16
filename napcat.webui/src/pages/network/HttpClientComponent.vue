<template>
    <div class="container">
        <div class="form-container">
            <h3>HTTP Client 配置</h3>
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
            </t-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { HttpClientConfig } from '../../../../src/onebot/config/config';
defineProps<{
    config: HttpClientConfig;
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