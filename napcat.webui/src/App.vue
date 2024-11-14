<!-- <template>
  <div id="app">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from './components/QQ.vue';
</script> -->
<template>
  <div id="app">
    <QQLogin />
  </div>
</template>

<script>
import QQLogin from './components/QQLogin.vue';

export default {
  name: 'App',
  components: {
    QQLogin
  }
};
</script>