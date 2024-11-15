<template>
  <div>
    <SidebarMenu :menuItems="menuItems" />
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
.content {
  margin-left: 200px; /* 根据侧边栏宽度调整 */
  padding: 20px;
}

@media (max-width: 768px) {
  .content {
    margin-left: 0; /* 移动端侧边栏收起 */
    padding: 10px;
  }
}
</style>