import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LaunchPage.vue') },
      { path: '/accounts', component: () => import('pages/AccountsPage.vue') },
      { path: '/microchains', component: () => import('pages/MicrochainsPage.vue') },
      { path: '/transfer', component: () => import('pages/TransferPage.vue') },
      { path: '/activity', component: () => import('pages/ActivityPage.vue') },
      { path: '/setting', component: () => import('pages/SettingPage.vue') },
      { path: '/onboarding', component: () => import('pages/OnBoardingPage.vue') },
      { path: '/initializewallet', component: () => import('pages/InitializeWalletPage.vue') },
      { path: '/recovery', component: () => import('pages/RecoveryPage.vue') }
    ]
  },
  {
    path: '/extension',
    component: () => import('layouts/ExtensionMainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/extension/LaunchPage.vue') },
      {
        path: 'accounts',
        component: () => import('pages/extension/AccountsPage.vue')
      },
      {
        path: 'microchains',
        component: () => import('pages/extension/MicrochainsPage.vue')
      },
      {
        path: 'transfer',
        component: () => import('pages/extension/TransferPage.vue')
      },
      {
        path: 'setting',
        component: () => import('pages/extension/SettingPage.vue')
      },
      { path: 'popup', component: () => import('pages/extension/PopupPage.vue') },
      { path: 'activity', component: () => import('pages/extension/ActivityPage.vue') }

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
