import EventEmitter from 'events'
import { ObservableStore } from '@metamask/obs-store'

export default class AppStateController extends EventEmitter {
  private store: ObservableStore<{ currentPopupId: number | undefined; currentExtensionPopupId: number }>
  /**
   * @param {object} opts
   */
  constructor () {
    super()

    this.store = new ObservableStore({
      currentPopupId: undefined,
      currentExtensionPopupId: 0
    })
  }

  /**
   * A setter for the currentPopupId which indicates the id of popup window that's currently active
   *
   * @param currentPopupId
   */
  setCurrentPopupId (currentPopupId: number | undefined) {
    this.store.updateState({
      currentPopupId
    })
  }

  /**
   * A getter to retrieve currentPopupId saved in the appState
   */
  getCurrentPopupId () {
    return this.store.getState().currentPopupId
  }
}
