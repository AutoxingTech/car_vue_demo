
import { createRouter, RouteRecordRaw, createWebHashHistory } from "vue-router"

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/starup'
    },
    {
        path: '/starup',
        name: 'starup',
        component: () => import('../views/Starup.vue')
    },
    {
        path: '/index',
        name: 'index',
        component: () => import('../views/Index.vue'),
        redirect: '/index/Fastdelivery',
        children: [
            {
                path: 'Fastdelivery',
                name: 'Fastdelivery',
                component: () => import('../components/Index/Fastdelivery.vue'),
            },
            {
                path: 'Multidelivery',
                name: 'Multidelivery',
                component: () => import('../components/Index/Multidelivery.vue'),
            },
            {
                path: 'Directdeliver',
                name: 'Directdeliver',
                component: () => import('../components/Index/Directdeliver.vue'),
            },
            {
                path: 'Cruise',
                name: 'Cruise',
                component: () => import('../components/Index/Cruise.vue'),
            },
            {
                path: 'Guide',
                name: 'Guide',
                component: () => import('../components/Index/Guide.vue'),
            }
        ]
    },
    {
        path: '/setting',
        name: 'setting',
        component: () => import('../views/Setting.vue'),
        redirect: '/setting/BasicSetting',
        children: [
            {
                path: 'BasicSetting',
                name: 'BasicSetting',
                component: () => import('../components/Setting/BasicSetting.vue'),
            },
            {
                path: 'VoliceSetting',
                name: 'VoliceSetting',
                component: () => import('../components/Setting/VoliceSetting.vue'),
            },
            {
                path: 'DeliverySetting',
                name: 'DeliverySetting',
                component: () => import('../components/Setting/DeliverySetting.vue'),
            },
            {
                path: 'CruiseSetting',
                name: 'CruiseSetting',
                component: () => import('../components/Setting/CruiseSetting.vue'),
            },
            {
                path: 'SystemSetting',
                name: 'SystemSetting',
                component: () => import('../components/Setting/SystemSetting.vue'),
            }

        ]
    },
    {
        path: '/task',
        name: 'task',
        component: () => import('../views/Task.vue')
    },
    {
        path: '/crashstop',
        name: 'crashstop',
        component: () => import('../views/Crashstop.vue')
    },
    {
        path: '/ficsetting',
        name: 'ficsetting',
        component: () => import('../components/ficsetting.vue')
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router