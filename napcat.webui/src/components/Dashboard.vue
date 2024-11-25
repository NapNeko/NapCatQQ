<template>
    <t-layout class="dashboard-container">
        <div ref="menuRef">
            <SidebarMenu :menu-items="menuItems" class="sidebar-menu" />
        </div>
        <t-layout>
            <router-view />
        </t-layout>
    </t-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SidebarMenu from './webui/Nav.vue';
import emitter from '@/ts/event-bus';
interface MenuItem {
    value: string;
    icon: string;
    label: string;
    route: string;
}

const menuItems = ref<MenuItem[]>([
    { value: 'item1', icon: 'dashboard', label: '基础信息', route: '/dashboard/basic-info' },
    { value: 'item3', icon: 'wifi-1', label: '网络配置', route: '/dashboard/network-config' },
    { value: 'item4', icon: 'setting', label: '其余配置', route: '/dashboard/other-config' },
    { value: 'item5', icon: 'system-log', label: '日志查看', route: '/dashboard/log-view' },
    { value: 'item6', icon: 'info-circle', label: '关于我们', route: '/dashboard/about-us' },
]);
const menuRef = ref<any>(null);
emitter.on('sendMenu', (event) => {
    emitter.emit('sendWidth', menuRef.value.offsetWidth);
    localStorage.setItem('menuWidth', menuRef.value.offsetWidth);
});
onMounted(() => {
    localStorage.setItem('menuWidth', menuRef.value.offsetWidth);
});
</script>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100%;
}

.sidebar-menu {
    position: relative;
    z-index: 2;
}

@media (max-width: 768px) {
    .content {
        padding: 10px;
    }
}
</style>
