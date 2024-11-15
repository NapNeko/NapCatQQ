<template>
  <div class="dashboard-container">
    <SidebarMenu :menuItems="menuItems" class="sidebar-menu" />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import SidebarMenu from './webui/Nav.vue';

export default {
  components: {
    SidebarMenu
  },
  data() {
    return {
      menuItems: [
        { value: 'item1', icon: 'dashboard', label: '基础信息', route: '/dashboard/basic-info' },
        { value: 'item3', icon: 'wifi-1', label: '网络配置', route: '/dashboard/network-config' },
        { value: 'item4', icon: 'setting', label: '其余配置', route: '/dashboard/other-config' },
        { value: 'item5', icon: 'system-log', label: '日志查看', route: '/dashboard/log-view' },
        { value: 'item6', icon: 'info-circle', label: '关于我们', route: '/dashboard/about-us' }
      ]
    };
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.sidebar-menu {
  position: relative;
  z-index: 2;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .content {
    padding: 10px;
  }
}
</style>