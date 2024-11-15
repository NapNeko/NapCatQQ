<template>
  <SidebarMenu :menuItems="menuItems" />
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
        { value: 'item1', icon: 'dashboard', label: '基础信息', route: '/basic-info' },
        { value: 'item3', icon: 'play-circle', label: '网络配置', route: '/network-config' },
        { value: 'item4', icon: 'edit-1', label: '日志查看', route: '/log-view' },
        { value: 'item5', icon: 'info-circle', label: '关于我们', route: '/about-us' }
      ]
    };
  }
}
</script>