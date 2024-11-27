<template>
    <div class="title">
        <t-divider content="其余配置" align="left" />
    </div>
    <t-card class="card">
        <div class="other-config-container">
            <div class="other-config">
                <t-form ref="form" :model="otherConfig" :label-align="labelAlign" label-width="auto" colon>
                    <t-form-item label="音乐签名地址" name="musicSignUrl" class="form-item">
                        <t-input v-model="otherConfig.musicSignUrl" />
                    </t-form-item>
                    <t-form-item label="启用本地文件到URL" name="enableLocalFile2Url" class="form-item">
                        <t-switch v-model="otherConfig.enableLocalFile2Url" />
                    </t-form-item>
                    <t-form-item label="启用上报解析合并消息" name="parseMultMsg" class="form-item">
                        <t-switch v-model="otherConfig.parseMultMsg" />
                    </t-form-item>
                </t-form>
                <div class="button-container">
                    <t-button @click="saveConfig">保存</t-button>
                </div>
            </div>
        </div>
    </t-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { OneBotConfig } from '../../../src/onebot/config/config';
import { QQLoginManager } from '@/backend/shell';

const otherConfig = ref<Partial<OneBotConfig>>({
    musicSignUrl: '',
    enableLocalFile2Url: false,
    parseMultMsg: true
});

const labelAlign = ref<string>();
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
            otherConfig.value.parseMultMsg = userConfig.parseMultMsg;
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
            userConfig.parseMultMsg = otherConfig.value.parseMultMsg ?? true;
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
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
            labelAlign.value = 'top';
        } else {
            labelAlign.value = 'left';
        }
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    const event = new Event('change');
    Object.defineProperty(event, 'matches', {
        value: mediaQuery.matches,
        writable: false,
    });
    mediaQuery.dispatchEvent(event);
    return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
    };
});
</script>

<style scoped>
.title {
    padding: 20px 20px 0 20px;
}
.card {
    margin: 0 20px;
    padding-top: 20px;
    padding-bottom: 20px;
}
.other-config-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    box-sizing: border-box;
}

.other-config {
    width: 100%;
    max-width: 500px;

    border-radius: 8px;
}

.form-item {
    margin-bottom: 20px;
    text-align: left;
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}
</style>
