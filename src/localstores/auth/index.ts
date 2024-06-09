import { defineStore } from 'pinia'
import localforage from 'localforage'
import * as middlewaretypes from '../../../src-bex/middleware/types'

export const useAuthStore = defineStore('application_authenticates', {
  state: () => ({
    auths: new Map<string, middlewaretypes.OriginRpcAuth>(),
    authStorage: localforage.createInstance({
      name: 'application-authenticates'
    }),
    loaded: false
  }),
  getters: {},
  actions: {
    reset () {
      void this.authStorage.setItem('authenticates', '{}')
    },
    load (listener?: () => void) {
      if (this.loaded) {
        return listener?.()
      }
      this.authStorage
        .getItem('authenticates')
        .then((authenticates) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
          const _auths = JSON.parse(authenticates as string) || {}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.keys(_auths).forEach((k: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.auths.set(k, _auths[k] as middlewaretypes.OriginRpcAuth)
          })
          this.loaded = true
          listener?.()
        })
        .catch((e) => {
          console.log('Load authenticates', e)
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
    saveAuths () {
      this.storeReady(() => {
        const obj = {} as Record<string, middlewaretypes.OriginRpcAuth>
        this.auths.forEach((methods, origin) => {
          obj[origin] = methods
        })
        this.authStorage.setItem('authenticates', JSON.stringify(obj))
          .catch((e) => {
            console.log(e)
          })
      })
    },
    addChain (origin: string, publicKey: string, chainId: string) {
      this.auths.set(origin, {
        publicKey,
        chainId,
        methods: []
      } as middlewaretypes.OriginRpcAuth)
      this.saveAuths()
    },
    addAuth (origin: string, method: middlewaretypes.RpcMethod) {
      const auth = this.auths.get(origin)
      if (!auth) {
        throw new Error('Invalid chain auth, please requestAccounts')
      }
      if (!auth.methods) {
        auth.methods = []
      }
      auth.methods.push(method)
      this.auths.set(origin, auth)
      this.saveAuths()
    }
  }
})
