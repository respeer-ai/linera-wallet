import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { useSettingStore } from 'src/localstores/setting/oneshot'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  router.beforeEach((to) => {
    const _setting = useSettingStore()
    if (to.meta?.ShowSideMenu !== undefined) {
      _setting.oneShotSetting.ShowSideMenu = to.meta.ShowSideMenu
    } else {
      _setting.oneShotSetting.ShowSideMenu = true
    }
    if (to.meta?.ShowHeaderMenu !== undefined) {
      _setting.oneShotSetting.ShowHeaderMenu = to.meta.ShowHeaderMenu
    } else {
      _setting.oneShotSetting.ShowHeaderMenu = true
    }
    if (to.meta?.ExtensionMode !== undefined) {
      _setting.oneShotSetting.ExtensionMode = to.meta.ExtensionMode
    }
    if (to.meta?.ShowFooterMenu !== undefined) {
      _setting.oneShotSetting.ShowFooterMenu = to.meta.ShowFooterMenu
    } else {
      _setting.oneShotSetting.ShowFooterMenu = true
    }
    if (to.meta?.ShowTestTip !== undefined) {
      _setting.oneShotSetting.ShowTestTip = to.meta.ShowTestTip
    } else {
      _setting.oneShotSetting.ShowTestTip = true
    }
  })

  return router
})
