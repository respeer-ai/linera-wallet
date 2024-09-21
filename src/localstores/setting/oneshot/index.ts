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
    }
  },
  actions: {}
})

export * from './types'
export * from './const'
