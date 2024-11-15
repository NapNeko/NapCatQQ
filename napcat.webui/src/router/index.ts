import { createWebHistory, createRouter } from 'vue-router'
import Dashboard from '../components/Dashboard.vue';
import QQLogin from '../components/QQLogin.vue';
import WebUiLogin from '../components/WebUiLogin.vue';

const routes = [
  { path: '/', redirect: '/webui' },
  { path: '/webui', component: WebUiLogin, name: 'WebUiLogin' },
  { path: '/qqlogin', component: QQLogin , name: 'QQLogin'},
  { path: '/dashboard', component: Dashboard, name: 'Dashboard' }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})