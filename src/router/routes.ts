import { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    ShowSideMenu?: boolean
    ShowHeaderMenu?: boolean
    ExtensionMode?: boolean
    ShowFooterMenu?: boolean
    ShowTestTip?: boolean
    AlignPageCenter?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LaunchPage.vue') },
      {
        path: 'accounts',
        component: () => import('pages/AccountsPage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      {
        path: 'microchains',
        component: () => import('pages/MicrochainsPage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      { path: 'transfer', component: () => import('pages/TransferPage.vue') },
      {
        path: 'activity',
        component: () => import('pages/ActivityPage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      { path: 'setting', component: () => import('pages/SettingPage.vue') },
      { path: 'onboarding', component: () => import('pages/OnBoardingPage.vue') },
      {
        path: 'initializewallet',
        component: () => import('pages/InitializeWalletPage.vue'),
        meta: {
          ShowSideMenu: false
        }
      },
      {
        path: 'importwallet',
        component: () => import('pages/ImportWalletPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: '/recovery',
        component: () => import('pages/RecoveryPage.vue'),
        meta: {
          ShowSideMenu: false
        }
      }
    ]
  },
  {
    path: '/extension',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      ExtensionMode: true,
      ShowFooterMenu: false,
      ShowTestTip: false
    },
    children: [
      {
        path: '',
        component: () => import('pages/LaunchPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'onboarding',
        component: () => import('pages/OnBoardingPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'recovery',
        component: () => import('pages/RecoveryPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'importwallet',
        component: () => import('pages/ImportWalletPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'initializewallet',
        component: () => import('pages/InitializeWalletPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'accountinfo',
        component: () => import('pages/AccountInfoPage.vue'),
        meta: {
          ShowFooterMenu: true,
          AlignPageCenter: false
        }
      },
      {
        path: 'accounts',
        component: () => import('pages/extension/AccountsPage.vue'),
        meta: {
          ShowFooterMenu: true
        }
      },
      {
        path: 'microchains',
        component: () => import('pages/MicrochainsPage.vue'),
        meta: {
          ShowFooterMenu: true,
          AlignPageCenter: false
        }
      },
      {
        path: 'transfer',
        component: () => import('pages/TransferPage.vue'),
        meta: {
          ShowFooterMenu: true,
          AlignPageCenter: false
        }
      },
      {
        path: 'setting',
        component: () => import('pages/SettingPage.vue'),
        meta: {
          ShowFooterMenu: true,
          AlignPageCenter: false
        }
      },
      { path: 'popup', component: () => import('pages/extension/PopupPage.vue') },
      {
        path: 'activity',
        component: () => import('pages/extension/ActivityPage.vue'),
        meta: {
          ShowFooterMenu: true,
          AlignPageCenter: false
        }
      }

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
