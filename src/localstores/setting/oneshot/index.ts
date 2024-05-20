import { defineStore } from 'pinia'
import { OneShotSetting } from './types'

export const useSettingStore = defineStore('one-shot-setting', {
  state: () => ({
    oneShotSetting: {} as OneShotSetting
  }),
  getters: {
    showHeaderMenu (): boolean {
      return this.oneShotSetting.ShowHeaderMenu
    },
    showSideMenu (): boolean {
      return this.oneShotSetting.ShowSideMenu
    },
    extensionMode (): boolean {
      return this.oneShotSetting.ExtensionMode
    },
    showFooterMenu (): boolean {
      return this.oneShotSetting.ShowFooterMenu
    },
    showTestTip (): boolean {
      return this.oneShotSetting.ShowTestTip
    },
    alignPageCenter (): boolean {
      return this.oneShotSetting.AlignPageCenter
    }
  },
  actions: {}
})
