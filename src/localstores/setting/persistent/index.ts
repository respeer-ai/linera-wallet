import { defineStore } from 'pinia'
import { PersistentSetting } from './types'
import localforage from 'localforage'
import * as constant from 'src/const'

export const useSettingStore = defineStore('persistent-setting', {
  state: () => ({
    persistentSetting: {} as PersistentSetting,
    walletStorage: localforage.createInstance({
      name: 'setting'
    }),
    loaded: false
  }),
  getters: {
    faucetHTTPUrl (): string {
      return constant.toUrl(
        this.persistentSetting.faucetSchema,
        this.persistentSetting.faucetHost,
        this.persistentSetting.faucetPort
      )
    },
    faucetWSUrl (): string {
      return constant.toUrl(
        this.persistentSetting.faucetWSSchema,
        this.persistentSetting.faucetHost,
        this.persistentSetting.faucetPort
      )
    },
    rpcHTTPUrl (): string {
      return constant.toUrl(
        this.persistentSetting.rpcSchema,
        this.persistentSetting.rpcHost,
        this.persistentSetting.rpcPort
      )
    },
    rpcWSUrl (): string {
      return constant.toUrl(
        this.persistentSetting.rpcWSSchema,
        this.persistentSetting.rpcHost,
        this.persistentSetting.rpcPort
      )
    },
    currentPopupId (): number {
      return this.persistentSetting.currentPopupId
    },
    nextPopupId (): number {
      return this.persistentSetting.nextPopupId
    }
  },
  actions: {
    reset () {
      void this.walletStorage.setItem('setting', '{}')
    },
    load (listener?: () => void) {
      if (this.loaded) {
        return listener?.()
      }
      this.walletStorage
        .getItem('setting')
        .then((setting) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          this.persistentSetting = JSON.parse(setting as string) || {}
          this.loaded = true
          listener?.()
        })
        .catch((e) => {
          console.log('Load setting', e)
        })
    },
    storeReady (ready: () => void) {
      if (this.loaded) {
        ready()
        return
      }
      setTimeout(() => {
        this.storeReady(ready)
      }, 100)
    },
    saveSetting () {
      this.storeReady(() => {
        this.walletStorage
          .setItem('setting', JSON.stringify(this.persistentSetting))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    setFaucet (
      schema: constant.HTTPSchema,
      wsSchema: constant.WSSchema,
      host: string,
      port: number
    ) {
      this.persistentSetting.faucetSchema = schema
      this.persistentSetting.faucetWSSchema = wsSchema
      this.persistentSetting.faucetHost = host
      this.persistentSetting.faucetPort = port
      this.saveSetting()
    },
    setRPC (
      schema: constant.HTTPSchema,
      wsSchema: constant.WSSchema,
      host: string,
      port: number
    ) {
      this.persistentSetting.rpcSchema = schema
      this.persistentSetting.rpcWSSchema = wsSchema
      this.persistentSetting.rpcHost = host
      this.persistentSetting.rpcPort = port
      this.saveSetting()
    },
    setCurrentPopupId (popupId: number) {
      this.persistentSetting.currentPopupId = popupId
      this.persistentSetting.nextPopupId = popupId + 1
      this.saveSetting()
    }
  }
})
