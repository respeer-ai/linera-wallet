import { defineStore } from 'pinia'
import { OneShotSetting } from './types'

export const useSettingStore = defineStore('setting', {
  state: () => ({
    oneShotSetting: {} as OneShotSetting
  }),
  getters: {
    showHeaderMenu (): boolean {
      return this.oneShotSetting.ShowHeaderMenu
    },
    showSideMenu (): boolean {
      return this.oneShotSetting.ShowSideMenu
    }
  },
  actions: {}
})
