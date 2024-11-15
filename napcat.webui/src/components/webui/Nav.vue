<template>
  <t-menu theme="light" default-value="2-1" :collapsed="collapsed">
    <template #logo>
      <span>WebUi</span>
    </template>
    <router-link v-for="item in menuItems" :key="item.value" :to="item.route">
      <t-menu-item :value="item.value" :disabled="item.disabled">
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