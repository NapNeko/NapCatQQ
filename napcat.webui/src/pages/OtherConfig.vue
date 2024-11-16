<template>
    <div>
        <t-divider content="其余配置" align="left" />
    </div>
    <div class="other-config-container">
        <div class="other-config">
            <t-form ref="form" :model="otherConfig" class="form">
                <t-form-item label="音乐签名地址" name="musicSignUrl" class="form-item">
                    <t-input v-model="otherConfig.musicSignUrl" />
                </t-form-item>
                <t-form-item label="启用本地文件到URL" name="enableLocalFile2Url" class="form-item">
                    <t-switch v-model="otherConfig.enableLocalFile2Url" />
                </t-form-item>
            </t-form>
            <div class="button-container">
                <t-button @click="saveConfig">保存</t-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { OneBotConfig } from '../../../src/onebot/config/config';
import { QQLoginManager } from '@/backend/shell';

const otherConfig = ref<Partial<OneBotConfig>>({
    musicSignUrl: '',
    enableLocalFile2Url: false,
});

const getOB11Config = async (): Promise<OneBotConfig | undefined> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.GetOB11Config();
};

const setOB11Config = async (config: OneBotConfig): Promise<boolean> => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        console.error('No stored credential found');
        return false;
    }
    const loginManager = new QQLoginManager(storedCredential);
    return await loginManager.SetOB11Config(config);
};

const loadConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        if (userConfig) {
            otherConfig.value.musicSignUrl = userConfig.musicSignUrl;
            otherConfig.value.enableLocalFile2Url = userConfig.enableLocalFile2Url;
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
};

const saveConfig = async () => {
    try {
        const userConfig = await getOB11Config();
        if (userConfig) {
            userConfig.musicSignUrl = otherConfig.value.musicSignUrl || '';
            userConfig.enableLocalFile2Url = otherConfig.value.enableLocalFile2Url ?? false;
            const success = await setOB11Config(userConfig);
            if (success) {
                MessagePlugin.success('配置保存成功');
            } else {
                MessagePlugin.error('配置保存失败');
            }
        }
    } catch (error) {
        console.error('Error saving config:', error);
        MessagePlugin.error('配置保存失败');
    }
};

onMounted(() => {
    loadConfig();
});
</script>

<style scoped>
.other-config-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
}

.other-config {
    width: 100%;
    max-width: 600px;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
}

.form {
    display: flex;
    flex-direction: column;
}

.form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.button-container {
    display: flex;
    justify-content: center;
}

@media (min-width: 768px) {
    .form-item {
        flex-direction: row;
        align-items: center;
    }

    .form-item t-input,
    .form-item t-switch {
        flex: 1;
        margin-left: 20px;
    }
}
</style>