import { defineStore } from 'pinia'
import { HomeAction, Menu, Setting } from './types'
import { MicrochainsImportState } from './const'

export const useSettingStore = defineStore('settings', {
  state: () =>
    ({
      SelectedSettingMenu: Menu.NETWORKS,
      HomeAction: HomeAction.SHOW_MAIN
    } as Setting),
  getters: {
    showHeaderMenu(): boolean {
      return this.ShowHeaderMenu
    },
    extensionMode(): boolean {
      return this.ExtensionMode
    },
    showFooterMenu(): boolean {
      return this.ShowFooterMenu
    },
    alignPageCenter(): boolean {
      return this.AlignPageCenter
    },
    showSettingMenu(): boolean {
      return this.ShowSettingMenu
    },
    selectedSettingMenu(): Menu {
      return this.SelectedSettingMenu
    },
    homeAction(): HomeAction {
      return this.HomeAction
    },
    homeActionParams(): unknown {
      return this.HomeActionParams
    },
    creatingDefaultNetwork(): boolean {
      return this.CreatingDefaultNetwork
    },
    creatingDefaultToken(): boolean {
      return this.CreatingDefaultToken
    },
    basePath(): string {
      return this.ExtensionMode ? '/extension' : '/'
    },
    formalizePath(): (path: string) => string {
      return (path: string) => {
        path = path.slice(
          path.indexOf('/extension') + path.indexOf('/extension') >= 0
            ? '/extension'.length
            : 0
        )
        path = path.slice(
          path.indexOf('/') + path.indexOf('/') >= 0 ? '/'.length : 0
        )
        return this.ExtensionMode ? '/extension/' + path : '/' + path
      }
    },
    inPopupContext(): boolean {
      return this.InPopupContext
    },
    microchainsImportState(): MicrochainsImportState {
      return this.MicrochainsImportState
    }
  },
  actions: {}
})

export * from './types'
export * from './const'
