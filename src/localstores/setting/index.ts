import { defineStore } from 'pinia'
import { Setting } from './types'
import localforage from 'localforage'
import * as constant from 'src/const'

export const useSettingStore = defineStore('setting', {
  state: () => ({
    setting: {} as Setting,
    walletStorage: localforage.createInstance({
      name: 'setting'
    }),
    loaded: false
  }),
  getters: {
    faucetHTTPUrl (): string {
      return constant.toUrl(this.setting.faucetSchema, this.setting.faucetHost, this.setting.faucetPort)
    },
    faucetWSUrl (): string {
      return constant.toUrl(this.setting.faucetWSSchema, this.setting.faucetHost, this.setting.faucetPort)
    },
    rpcHTTPUrl (): string {
      return constant.toUrl(this.setting.rpcSchema, this.setting.rpcHost, this.setting.rpcPort)
    },
    rpcWSUrl (): string {
      return constant.toUrl(this.setting.rpcWSSchema, this.setting.rpcHost, this.setting.rpcPort)
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
      this.walletStorage.getItem('setting')
        .then((setting) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          this.setting = JSON.parse(setting as string)
          this.loaded = true
          listener?.()
        })
        .catch((e) => {
          console.log('Load accounts', e)
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
        this.walletStorage.setItem('accounts', JSON.stringify(this.setting))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    setFaucet (schema: constant.HTTPSchema, wsSchema: constant.WSSchema, host: string, port: number) {
      this.setting.faucetSchema = schema
      this.setting.faucetWSSchema = wsSchema
      this.setting.faucetHost = host
      this.setting.faucetPort = port
      this.saveSetting()
    },
    setRPC (schema: constant.HTTPSchema, wsSchema: constant.WSSchema, host: string, port: number) {
      this.setting.rpcSchema = schema
      this.setting.rpcWSSchema = wsSchema
      this.setting.rpcHost = host
      this.setting.rpcPort = port
      this.saveSetting()
    }
  }
})
