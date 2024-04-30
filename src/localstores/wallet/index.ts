import { defineStore } from 'pinia'
import { Account } from './types'
import localforage from 'localforage'

export const useWalletStore = defineStore('checko-wallet', {
  state: () => ({
    accounts: new Map<string, Account>(),
    currentAddress: undefined as unknown as string,
    chains: new Map<string, Map<string, number>>(),
    chainBalances: new Map<string, number>(),
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
    currentChains (): Map<string, number> {
      return this.chains.get(this.currentAddress) || new Map<string, number>()
    },
    accountChains (): (publicKey: string) => Map<string, number> {
      return (publicKey: string) => {
        return this.chains.get(publicKey) || new Map<string, number>()
      }
    },
    account (): (publicKey: string) => Account | undefined {
      return (publicKey: string) => {
        return this.accounts.get(publicKey)
      }
    },
    _chains (): Map<string, Map<string, number>> {
      return this.chains
    },
    _chainBalances (): Map<string, number> {
      return this.chainBalances
    }
  },
  actions: {
    reset () {
      void this.walletStorage.setItem('accounts', '{}')
      void this.walletStorage.setItem('chains', '{}')
      void this.walletStorage.setItem('current-address', undefined)
    },
    load (listener?: () => void) {
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
          listener?.()
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
            const kChains = new Map<string, number>()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            Object.keys(_chains[k]).forEach((k, v) => {
              kChains.set(k, v)
            })
            this.chains.set(k, kChains)
            listener?.()
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
        const obj = {} as Record<string, unknown>
        this.chains.forEach((v, k) => {
          obj[k] = Object.fromEntries(v)
        })
        this.walletStorage.setItem('chains', JSON.stringify(obj))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    addChain (publicKey: string, chainId: string) {
      let chains = this.chains.get(publicKey)
      if (!chains) chains = new Map<string, number>()
      if (chains?.has(chainId)) return
      chains.set(chainId, 0)
      this.chains.set(publicKey, chains)
      this.saveChains()
    },
    setAccountBalance (publicKey: string, chainId: string, balance: number) {
      const chains = this.chains.get(publicKey)
      if (!chains) {
        throw Error('Invalid public key')
      }
      const _balance = chains?.get(chainId)
      if (_balance === undefined) {
        throw Error('Invalid account chain')
      }
      chains.set(chainId, balance)
      this.chains.set(publicKey, chains)
      this.saveChains()
    },
    setChainBalance (chainId: string, balance: number) {
      this.chainBalances.set(chainId, balance)
    }
  }
})
