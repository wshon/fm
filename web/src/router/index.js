import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import FileView from '../views/File.vue'
import ShareView from '../views/Share.vue'
import UserView from '../views/User.vue'
import SettingView from '../views/Setting.vue'
import SystemView from '../views/System.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {path: '/file', name: 'file', component: FileView},
    {path: '/share', name: 'share', component: ShareView},
    {path: '/user', name: 'user', component: UserView},
    {path: '/setting', name: 'setting', component: SettingView},
    {path: '/system', name: 'system', component: SystemView},
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router
