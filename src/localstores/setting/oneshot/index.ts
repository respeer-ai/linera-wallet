import { defineStore } from 'pinia'
import { HomeAction, Menu, OneShotSetting } from './types'

export const useSettingStore = defineStore('one-shot-setting', {
  state: () => ({
    oneShotSetting: {
      SelectedSettingMenu: Menu.NETWORKS,
      HomeAction: HomeAction.SHOW_MAIN
    } as OneShotSetting
  }),
  getters: {
    showHeaderMenu (): boolean {
      return this.oneShotSetting.ShowHeaderMenu
    },
    extensionMode (): boolean {
      return this.oneShotSetting.ExtensionMode
    },
    showFooterMenu (): boolean {
      return this.oneShotSetting.ShowFooterMenu
    },
    alignPageCenter (): boolean {
      return this.oneShotSetting.AlignPageCenter
    },
    showSettingMenu (): boolean {
      return this.oneShotSetting.ShowSettingMenu
    },
    selectedSettingMenu (): Menu {
      return this.oneShotSetting.SelectedSettingMenu
    },
    homeAction (): HomeAction {
      return this.oneShotSetting.HomeAction
    },
    homeActionParams (): unknown {
      return this.oneShotSetting.HomeActionParams
    },
    creatingDefaultNetwork (): boolean {
      return this.oneShotSetting.CreatingDefaultNetwork
    },
    creatingDefaultToken (): boolean {
      return this.oneShotSetting.CreatingDefaultToken
    },
    basePath (): string {
      return this.oneShotSetting.ExtensionMode ? '/extension' : '/'
    },
    formalizePath (): (path: string) => string {
      return (path: string) => {
        path = path.slice(path.indexOf('/extension') + path.indexOf('/extension') >= 0 ? '/extension'.length : 0)
        path = path.slice(path.indexOf('/') + path.indexOf('/') >= 0 ? '/'.length : 0)
        return this.oneShotSetting.ExtensionMode ? '/extension/' + path : '/' + path
      }
    },
    inPopupContext (): boolean {
      return this.oneShotSetting.InPopupContext
    }
  },
  actions: {}
})

export * from './types'
export * from './const'
