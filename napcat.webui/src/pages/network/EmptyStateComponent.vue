<template>
    <div class="empty-state">
        <p>当前没有网络配置</p>
        <t-button @click="showAddTabDialog">添加网络配置</t-button>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps<{ showAddTabDialog: () => void }>();
</script>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}
</style>
