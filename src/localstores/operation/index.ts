import { defineStore } from 'pinia'
import { ChainOperation } from './types'

type tickerRunFunc = () => void

export const useOperationStore = defineStore('operations', {
  state: () => ({
    operations: [] as ChainOperation[],
    tickerRuns: new Map<string, tickerRunFunc>()
  }),
  getters: {},
  actions: {}
})

export * from './types'
