<template>
    <t-menu theme="light" default-value="2-1" :collapsed="collapsed" class="sidebar-menu">
        <template #logo> </template>
        <router-link v-for="item in menuItems" :key="item.value" :to="item.route">
            <t-menu-item :value="item.value" :disabled="item.disabled" class="menu-item">
                <template #icon>
                    <t-icon :name="item.icon" />
                </template>
                {{ item.label }}
            </t-menu-item>
        </router-link>
        <template #operations>
            <t-button class="t-demo-collapse-btn" variant="text" shape="square" @click="changeCollapsed">
                <template #icon><t-icon :name="iconName" /></template>
            </t-button>
        </template>
    </t-menu>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

type MenuItem = {
    value: string;
    label: string;
    route: string;
    icon?: string;
    disabled?: boolean;
};

defineProps<{
    menuItems: MenuItem[];
}>();

const collapsed = ref<boolean>(localStorage.getItem('sidebar-collapsed') === 'true');
const iconName = ref<string>(collapsed.value ? 'menu-unfold' : 'menu-fold');

const changeCollapsed = (): void => {
    collapsed.value = !collapsed.value;
    iconName.value = collapsed.value ? 'menu-unfold' : 'menu-fold';
    localStorage.setItem('sidebar-collapsed', collapsed.value.toString());
};
</script>

<style scoped>
.sidebar-menu {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 200px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .sidebar-menu {
        width: 100px; /* 移动端侧边栏宽度 */
    }
}

.logo-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.menu-item {
    margin-bottom: 10px;
}
</style>
