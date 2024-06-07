import { defineStore } from 'pinia'
import { BexPayload } from '@quasar/app-vite'
import { commontypes } from 'src/types'

export const usePopupStore = defineStore('popups', {
  state: () => ({
    popups: new Map<number, unknown>()
  }),
  getters: {
    requestIds (): Array<number> {
      return Array.from(this.popups.keys())
    }
  },
  actions: {
    insertRequest (payload: BexPayload<commontypes.PopupRequest, unknown>) {
      this.popups.set(Number(payload.data.request.id), payload)
    }
  }
})
