<template>
    <div class="title">
        <t-divider content="面板基础信息" align="left">
            <template #content>
                <div style="display: flex; justify-content: center; align-items: center">
                    <DashboardIcon />
                    <div style="margin-left: 5px">面板基础信息</div>
                </div>
            </template>
        </t-divider>
        <t-divider align="right">
            <t-button @click="getQQLoginInfo()" :loading="info.loading">
                <template #icon> <RefreshIcon /> </template>
                刷新
            </t-button>
        </t-divider>
    </div>
    <t-card class="card">
        <t-descriptions bordered :column="info.column">
            <t-descriptions-item label="QQ">{{ info.data.uin }}</t-descriptions-item>
            <t-descriptions-item label="昵称">{{ info.data.nick }}</t-descriptions-item>
            <t-descriptions-item label="在线状态">
                <t-tag :theme="info.data.online ? 'success' : 'danger'">{{ info.data.online ? '在线' : '离线' }}</t-tag>
            </t-descriptions-item>
        </t-descriptions>
    </t-card>
</template>
<script setup lang="ts">
import { DashboardIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { QQLoginManager } from '@/backend/shell';
import { onBeforeUnmount, onMounted, reactive } from 'vue';

const info = reactive<{
    column: number;
    loading: boolean;
    data: {
        uin: number;
        uid: string;
        nick: string;
        online: boolean;
    };
}>({
    column: 3,
    loading: false,
    data: {
        uin: 0,
        uid: '',
        nick: '',
        online: false,
    },
});

const handleResize = () => {
    if (window.innerWidth > 768) {
        info.column = 3;
    } else if (window.innerWidth > 425) {
        info.column = 2;
    } else {
        info.column = 1;
    }
};

const getQQLoginInfo = () => {
    const storedCredential = localStorage.getItem('auth');
    if (!storedCredential) {
        return;
    }
    info.loading = true;
    const loginManager = new QQLoginManager(storedCredential);
    // TODO 目前没有给定返回类型,后续视情况拓展后指定

    loginManager
        .getQQLoginInfo()
        .then((res) => {
            info.data = res;
        })
        .finally(() => {
            info.loading = false;
        });
};

onMounted(() => {
    getQQLoginInfo();
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.title {
    padding: 20px 20px 0 20px;
    display: flex;
    justify-content: space-between;
}

.card {
    margin: 0 20px;
    padding-top: 20px;
    padding-bottom: 20px;
}
</style>
