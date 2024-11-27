<template>
    <t-menu theme="light" default-value="2-1" :collapsed="collapsed" class="sidebar-menu">
        <template #logo>
            <div class="logo">
                <img class="logo-img" :width="collapsed ? 35 : 'auto'" src="@/assets/logo_webui.png" alt="logo" />
                <div class="logo-textBox">
                    <div class="logo-text">{{ collapsed ? '' : 'NapCat' }}</div>
                </div>
            </div>
        </template>
        <router-link v-for="item in menuItems" :key="item.value" :to="item.route">
            <t-tooltip :disabled="!collapsed" :content="item.label" placement="right">
                <t-menu-item :value="item.value" :disabled="item.disabled" class="menu-item">
                    <template #icon>
                        <t-icon :name="item.icon" />
                    </template>
                    {{ item.label }}
                </t-menu-item>
            </t-tooltip>
        </router-link>
        <template #operations>
            <t-button
                :disabled="disBtn"
                class="t-demo-collapse-btn"
                variant="text"
                shape="square"
                @click="changeCollapsed"
            >
                <template #icon><t-icon :name="iconName" /></template>
            </t-button>
        </template>
    </t-menu>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch } from 'vue';
import emitter from '@/ts/event-bus';

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
const disBtn = ref<boolean>(false);

const changeCollapsed = (): void => {
    collapsed.value = !collapsed.value;
    iconName.value = collapsed.value ? 'menu-unfold' : 'menu-fold';
    localStorage.setItem('sidebar-collapsed', collapsed.value.toString());
};
watch(collapsed, (newValue, oldValue) => {
    setTimeout(() => {
        emitter.emit('sendMenu', collapsed.value);
    }, 300);
});
onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 800px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
        disBtn.value = e.matches;
        if (e.matches) {
            collapsed.value = e.matches;
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
.logo {
    display: flex;
    width: auto;
    height: 100%;
}
.logo-img {
    object-fit: contain;
    margin-top: 8px;
    margin-bottom: 8px;
}
.logo-textBox {
    display: flex;
    align-items: center;
    margin-left: 10px;
}
.logo-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 22px;
    font-family: Sotheby, Helvetica, monospace;
}

.menu-item {
    margin-bottom: 10px;
}
</style>
