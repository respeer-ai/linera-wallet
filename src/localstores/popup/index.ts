import { defineStore } from 'pinia'
import { BexPayload } from '@quasar/app-vite'
import { commontypes } from 'src/types'
import { ConnectionInfo } from './types'
import * as middlewaretypes from '../../../src-bex/middleware/types'

export const usePopupStore = defineStore('popups', {
  state: () => ({
    popups: new Map<number, unknown>(),
    connections: new Map<string, ConnectionInfo>(),
    popupType: middlewaretypes.PopupRequestType.CONFIRMATION,
    popupOrigin: '',
    popupRequest: middlewaretypes.RpcMethod.ETH_REQUEST_ACCOUNTS,
    popupRequestId: 0
  }),
  getters: {
    requestIds (): Array<number> {
      return Array.from(this.popups.keys())
    },
    connection (): (origin: string) => ConnectionInfo | undefined {
      return (origin: string) => {
        return this.connections.get(origin)
      }
    },
    currentConnection (): ConnectionInfo | undefined {
      return this.connection(this.popupOrigin)
    },
    _popupType (): middlewaretypes.PopupRequestType {
      return this.popupType
    },
    _popupRequest (): middlewaretypes.RpcMethod {
      return this.popupRequest
    },
    _popupRespond (): (...payload: unknown extends never ? [] : [unknown]) => Promise<BexPayload<commontypes.PopupRequest, unknown>> | undefined {
      const popup = this.popups.get(this.popupRequestId) as BexPayload<commontypes.PopupRequest, unknown>
      return popup?.respond
    }
  },
  actions: {
    insertRequest (payload: BexPayload<commontypes.PopupRequest, unknown>) {
      this.popupType = payload.data.type
      this.popupRequest = payload.data.request.request.method as middlewaretypes.RpcMethod
      this.popupRequestId = Number(payload.data.request.request.id)
      this.popups.set(Number(payload.data.request.request.id), payload)
    },
    removeRequest (requestId: number) {
      this.popups.delete(requestId)
    },
    addConnection (connection: ConnectionInfo) {
      this.popupOrigin = connection.origin
      this.connections.set(connection.origin, connection)
    }
  }
})
