<template>
    <t-head-menu theme="light" class="bottom-menu" default-value="item1">
        <router-link v-for="item in menuItems" :key="item.value" :to="item.route">
            <t-tooltip :content="item.label" placement="top">
                <t-menu-item :value="item.value" :disabled="item.disabled" class="menu-item">
                    <template #icon>
                        <t-icon :name="item.icon" />
                    </template>

                    <!--                    {{item.label}}-->
                </t-menu-item>
            </t-tooltip>
        </router-link>
    </t-head-menu>
</template>
<script setup lang="ts">
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
</script>
<style scoped>
.bottom-menu {
    display: flex;
    justify-content: center;
    border-top: 0.8px solid #ddd;
}
</style>
