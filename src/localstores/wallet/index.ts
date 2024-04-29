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
  getters: {
    publicKeys (): Array<string> {
      return Array.from(this.accounts.keys())
    }
  },
  actions: {
    load () {
      this.walletStorage.getItem('accounts')
        .then((accounts) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          const _accounts = JSON.parse(accounts as string)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.keys(_accounts).forEach((k: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.accounts.set(k, _accounts[k] as Account)
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
    forceSaveAccount () {
      this.walletStorage.setItem('accounts', JSON.stringify(Object.fromEntries(this.accounts)))
        .catch((e) => {
          console.log(e)
        })
    },
    saveAccount () {
      this.storeReady(() => {
        this.forceSaveAccount()
      })
    },
    addAccount (publicKey: string, privateKey: string) {
      this.accounts.set(publicKey, {
        privateKey,
        balance: 0
      })
      this.forceSaveAccount()
      this.saveAccount()
    }
  }
})
