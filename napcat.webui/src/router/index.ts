import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import BasicInfo from '../pages/BasicInfo.vue';
import AboutUs from '../pages/AboutUs.vue';
import LogView from '../pages/Log.vue';
import NetWork from '../pages/NetWork.vue';
import QQLogin from '../components/QQLogin.vue';
import WebUiLogin from '../components/WebUiLogin.vue';
import OtherConfig from '../pages/OtherConfig.vue';
import { MessagePlugin } from 'tdesign-vue-next';

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: '/webui' },
    { path: '/webui', component: WebUiLogin, name: 'WebUiLogin' },
    { path: '/qqlogin', component: QQLogin, name: 'QQLogin' },
    {
        path: '/dashboard',
        component: Dashboard,
        children: [
            { path: '', redirect: 'basic-info' },
            { path: 'basic-info', component: BasicInfo, name: 'BasicInfo' },
            { path: 'network-config', component: NetWork, name: 'NetWork' },
            { path: 'log-view', component: LogView, name: 'LogView' },
            { path: 'other-config', component: OtherConfig, name: 'OtherConfig' },
            { path: 'about-us', component: AboutUs, name: 'AboutUs' },
        ],
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth');
    if (!token && to.path !== '/webui' && to.path !== '/qqlogin') {
        MessagePlugin.error('Token 过期啦, 重新登录吧');
        localStorage.clear();
        setTimeout(() => {
            next('/webui');
        }, 500);
    } else {
        next();
    }
});

export default router;
