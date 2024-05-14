import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MicrochainsPage.vue') },
      { path: '/accounts', component: () => import('pages/AccountsPage.vue') },
      { path: '/microchains', component: () => import('pages/MicrochainsPage.vue') },
      { path: '/transfer', component: () => import('pages/TransferPage.vue') },
      { path: '/activity', component: () => import('pages/ActivityPage.vue') },
      { path: '/setting', component: () => import('pages/SettingPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
