<template>
    <div class="other-config">
        <div>
            <t-divider content="其余配置" align="left" />
        </div>
        <t-form ref="form" :model="otherConfig">
            <t-form-item label="音乐签名地址" name="musicSignUrl">
                <t-input v-model="otherConfig.musicSignUrl" />
            </t-form-item>
            <t-form-item label="启用本地文件到URL" name="enableLocalFile2Url">
                <t-switch v-model="otherConfig.enableLocalFile2Url" />
            </t-form-item>
        </t-form>
        <t-button @click="saveConfig">保存</t-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
            await setOB11Config(userConfig);
        }
    } catch (error) {
        console.error('Error saving config:', error);
    }
};

onMounted(() => {
    loadConfig();
});
</script>