<template>
    <t-layout class="dashboard-container">
        <div v-if="!mediaQuery.matches">
            <SidebarMenu
                :menu-items="menuItems"
                class="sidebar-menu"
                :menu-width="sidebarWidth"
            />
        </div>
        <t-layout>
            <router-view />
        </t-layout>
        <div v-if="mediaQuery.matches" class="bottom-menu">
            <BottomMenu :menu-items="menuItems" />
        </div>
    </t-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import SidebarMenu from './webui/Nav.vue';
import BottomMenu from './webui/NavBottom.vue';
import emitter from '@/ts/event-bus';
const mediaQuery = window.matchMedia('(max-width: 768px)');
const sidebarWidth = ['232px', '64px'];
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
emitter.on('sendMenu', (event) => {
    const menuWidth = event ? sidebarWidth[1] : sidebarWidth[0];
    emitter.emit('sendWidth', menuWidth);
    localStorage.setItem('menuWidth', menuWidth.toString() || '0');
});

onMounted(() => {
    if (mediaQuery.matches){
        localStorage.setItem('menuWidth', '0');
    }
});
onUnmounted(() => {
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
.bottom-menu {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 2;
}

@media (max-width: 768px) {
    .content {
        padding: 10px;
    }
}
</style>
<style>
@media (max-width: 768px) {
    .t-head-menu__inner .t-menu:first-child {
        margin-left: 0;
    }
    .t-head-menu__inner{
        width: 100%;
    }
    .t-head-menu .t-menu{
        justify-content: space-evenly;
    }
    .t-menu__content{
        display: none;
    }
}
</style>
