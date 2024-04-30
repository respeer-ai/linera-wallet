import { defineStore } from 'pinia'
import { Account } from './types'
import localforage from 'localforage'

export const useWalletStore = defineStore('checko-wallet', {
  state: () => ({
    accounts: new Map<string, Account>(),
    currentAddress: undefined as unknown as string,
    chains: new Map<string, Array<string>>(),
    walletStorage: localforage.createInstance({
      name: 'checko-wallet'
    }),
    loaded: false
  }),
  getters: {
    publicKeys (): Array<string> {
      return Array.from(this.accounts.keys())
    },
    currentAccount (): Account | undefined {
      return this.accounts.get(this.currentAddress)
    },
    accountChains (): (publicKey: string) => Array<string> {
      return (publicKey: string) => {
        return this.chains.get(publicKey) || []
      }
    },
    account (): (publicKey: string) => Account | undefined {
      return (publicKey: string) => {
        return this.accounts.get(publicKey)
      }
    }
  },
  actions: {
    reset () {
      void this.walletStorage.setItem('accounts', '{}')
      void this.walletStorage.setItem('chains', '{}')
      void this.walletStorage.setItem('current-address', undefined)
    },
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
          console.log('Load accounts', e)
        })
      this.walletStorage.getItem('chains')
        .then((chains) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          const _chains = JSON.parse(chains as string)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.keys(_chains).forEach((k: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.chains.set(k, _chains[k] as string[])
          })
        })
        .catch((e) => {
          console.log('Load chains', e)
        })
      this.walletStorage.getItem('current-address')
        .then((currentAddress) => {
          this.currentAddress = currentAddress as string
        })
        .catch((e) => {
          console.log('Load current address', e)
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
        this.walletStorage.setItem('accounts', JSON.stringify(Object.fromEntries(this.accounts)))
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
    },
    saveCurrentAddress () {
      this.storeReady(() => {
        this.walletStorage.setItem('current-address', this.currentAddress)
          .catch((e) => {
            console.log(e)
          })
      })
    },
    selectAddress (publicKey: string) {
      this.currentAddress = publicKey
      this.saveCurrentAddress()
    },
    saveChains () {
      this.storeReady(() => {
        this.walletStorage.setItem('chains', JSON.stringify(Object.fromEntries(this.chains)))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    addChain (publicKey: string, chainId: string) {
      let chains = this.chains.get(publicKey)
      if (!chains) chains = []
      if (chains?.includes(chainId)) return
      chains.push(chainId)
      this.chains.set(publicKey, chains)
      this.saveChains()
    }
  }
})
