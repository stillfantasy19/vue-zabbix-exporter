import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/authredirect', component: () => import('@/views/login/authredirect'), hidden: true },
  { path: '/404', component: () => import('@/views/errorPage/404'), hidden: true },
  { path: '/401', component: () => import('@/views/errorPage/401'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'dashboard',
      meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
    }]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [{
      path: 'index',
      component: () => import('@/views/guide/index'),
      name: 'guide',
      meta: { title: 'guide', icon: 'guide', noCache: true }
    }]
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  // {
  //   path: '/b2b',
  //   component: Layout,
  //   redirect: '/b2b/list',
  //   name: 'b2b',
  //   meta: {
  //     title: 'b2b',
  //     icon: 'example'
  //   },
  //   children: [
  //     { path: 'cooperNotice', component: () => import('@/views/b2b/cooperNotice'), name: 'cooperationNotes', meta: { title: 'cooperationNotes', icon: 'list' }},
  //     { path: 'homePic', component: () => import('@/views/b2b/homePic'), name: 'homePic', meta: { title: 'homePic', icon: 'list' }},
  //     { path: 'edit/:id(\\d+)', component: () => import('@/views/b2b/edit'), name: 'editArticle', meta: { title: 'editArticle', noCache: true }, hidden: true }
  //     // { path: 'list', component: () => import('@/views/b2b/list'), name: 'systemParam', meta: { title: 'systemParam', icon: 'list' }}
  //   ]
  // },
  // {
  //   path: '/systemManage',
  //   component: Layout,
  //   redirect: '/systemManage/role',
  //   name: 'systemManage',
  //   meta: {
  //     title: 'systemManage',
  //     icon: 'table'
  //   },
  //   children: [
  //     { path: 'role', component: () => import('@/views/systemManage/role'), name: 'role', meta: { title: 'role' }},
  //     { path: 'billConfig', component: () => import('@/views/systemManage/billConfig'), name: 'billConfig', meta: { title: 'billConfig' }}
  //
  //   ]
  // },

  { path: '*', redirect: '/404', hidden: true }
]
