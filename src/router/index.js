import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SystemUpdata from '../views/SystemUpdata.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes:[
  //   {
  //     path: '/',
  //     name: 'home',
  //     component: SystemUpdata
  //   },
  // ]
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/income',
      name: 'income',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Income.vue')
    },
    {
      path: '/burn',
      name: 'burn',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Burn.vue')
    },
    {
      path: '/team',
      name: 'team',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Team.vue')
    },
    {
      path: '/ecology',
      name: 'ecology',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Ecology.vue')
    },
    {
      path: '/introduction',
      name: 'introduction',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Introduction.vue')
    },
    {
      path: '/whitepaper',
      name: 'whitepaper',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/WhitePaper.vue')
    },
    {
      path: '/liquidity',
      name: 'liquidity',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Liquidity.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})
export default router
