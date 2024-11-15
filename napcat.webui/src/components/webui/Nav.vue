<template>
  <t-menu theme="light" default-value="2-1" :collapsed="collapsed" class="sidebar-menu">
    <template #logo>
      <span>WebUi</span>
    </template>
    <router-link v-for="item in menuItems" :key="item.value" :to="item.route">
      <t-menu-item :value="item.value" :disabled="item.disabled" class="menu-item">
        <template #icon>
          <t-icon :name="item.icon" />
        </template>
        {{ item.label }}
      </t-menu-item>
    </router-link>
  </t-menu>
</template>

<script>
export default {
  name: 'SidebarMenu',
  props: {
    menuItems: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.sidebar-menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 200px; /* 根据需要调整宽度 */
}

.menu-item {
  margin-bottom: 10px; /* 根据需要调整间距 */
}
</style>