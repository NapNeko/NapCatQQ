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
import { QQLoginManager } from '@/backend/shell';

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

router.beforeEach(async (to, from, next) => {
    const isPublicRoute = ['/webui', '/qqlogin'].includes(to.path);
    const token = localStorage.getItem('auth');

    if (!isPublicRoute) {
        if (!token) {
            MessagePlugin.error('请先登录');
            return next('/webui');
        }
        const login = await new QQLoginManager(token).checkWebUiLogined();
        if (!login) {
            MessagePlugin.error('请先登录');
            return next('/webui');
        }
    }
    next();
});

export default router;
