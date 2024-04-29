import { defineStore } from 'pinia'
import { Account } from './types'
import localforage from 'localforage'

export const useWalletStore = defineStore('checko-wallet', {
  state: () => ({
    accounts: new Map<string, Account>(),
    walletStorage: localforage.createInstance({
      name: 'checko-wallet'
    }),
    loaded: false
  }),
  getters: {},
  actions: {
    load () {
      this.walletStorage.getItem('accounts')
        .then((accounts) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          new Map(JSON.parse(accounts as string)).forEach((k, v) => {
            this.accounts.set(k as string, v as Account)
          })
          this.loaded = true
        })
        .catch((e) => {
          console.log(e)
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
    saveAccount () {
      this.storeReady(() => {
        this.walletStorage.setItem('accounts', JSON.stringify(Array.from(this.accounts)))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    addAccount (publicKey: string, privateKey: string) {
      this.accounts.set(publicKey, {
        privateKey,
        balance: 0
      })
      this.saveAccount()
    }
  }
})
