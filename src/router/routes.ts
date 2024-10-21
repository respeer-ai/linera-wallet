import { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    ShowHeaderMenu?: boolean
    ExtensionMode?: boolean
    ShowFooterMenu?: boolean
    ShowTestTip?: boolean
    AlignPageCenter?: boolean
    InPopupContext?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      ExtensionMode: false
    },
    children: [
      {
        path: '',
        component: () => import('pages/LaunchPage.vue'),
        meta: {
          AlignPageCenter: true
        }
      },
      {
        path: 'home',
        component: () => import('pages/HomePage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      {
        path: 'transfer',
        component: () => import('pages/TransferPage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      {
        path: 'onboarding',
        component: () => import('pages/OnBoardingPage.vue')
      },
      {
        path: 'improvement',
        component: () => import('pages/ImprovementPage.vue')
      },
      {
        path: 'initializewallet',
        component: () => import('pages/InitializeWalletPage.vue')
      },
      {
        path: 'importwallet',
        component: () => import('pages/ImportWalletPage.vue'),
        meta: {
          ShowHeaderMenu: false
        }
      },
      {
        path: 'recovery',
        component: () => import('pages/RecoveryPage.vue')
      },
      {
        path: 'resetwallet',
        component: () => import('pages/ResetWalletPage.vue'),
        meta: {
          ExtensionMode: false
        }
      }
    ]
  },
  {
    path: '/extension',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      ShowHeaderMenu: false,
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
        path: 'home',
        component: () => import('pages/HomePage.vue'),
        meta: {
          AlignPageCenter: false
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
        path: 'improvement',
        component: () => import('pages/ImprovementPage.vue'),
        meta: {
          AlignPageCenter: true
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
        path: 'resetwallet',
        component: () => import('pages/ResetWalletPage.vue')
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
        path: 'transfer',
        component: () => import('pages/TransferPage.vue'),
        meta: {
          AlignPageCenter: false
        }
      },
      {
        path: 'popup',
        component: () => import('pages/extension/PopupPage.vue'),
        meta: {
          ShowHeaderMenu: false,
          AlignPageCenter: false,
          InPopupContext: true
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
