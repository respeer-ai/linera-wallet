import { defineStore } from 'pinia'
import { ChainOperation } from './types'

export const useOperationStore = defineStore('operations', {
  state: () => ({
    operations: [] as ChainOperation[]
  }),
  getters: {},
  actions: {}
})

export * from './types'
