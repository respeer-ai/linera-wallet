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
    }
  },
  actions: {}
})

export * from './types'
export * from './const'
