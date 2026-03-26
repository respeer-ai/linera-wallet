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
    popupRequestId: 0,
    popupPrivData: undefined as unknown,
    popupUpdated: false
  }),
  getters: {
    requestIds(): Array<number> {
      return Array.from(this.popups.keys())
    },
    connection(): (origin: string) => ConnectionInfo | undefined {
      return (origin: string) => {
        return this.connections.get(origin)
      }
    },
    currentConnection(): ConnectionInfo | undefined {
      return this.connection(this.popupOrigin)
    },
    _popupType(): middlewaretypes.PopupRequestType {
      return this.popupType
    },
    _popupRequest(): middlewaretypes.RpcMethod {
      return this.popupRequest
    },
    _popupPayload(): BexPayload<commontypes.PopupRequest, unknown> {
      return this.popups.get(this.popupRequestId) as BexPayload<
        commontypes.PopupRequest,
        unknown
      >
    },
    _popupRespond(): (
      ...payload: unknown extends never ? [] : [unknown]
    ) => Promise<BexPayload<commontypes.PopupRequest, unknown>> | undefined {
      const popup = this.popups.get(this.popupRequestId) as BexPayload<
        commontypes.PopupRequest,
        unknown
      >
      return popup?.respond
    },
    _popupPrivData(): unknown {
      return this.popupPrivData
    },
    _popupUpdated(): boolean {
      return this.popupUpdated
    }
  },
  actions: {
    activateRequest(requestId?: number) {
      const _requestId = requestId ?? this.requestIds[0]
      if (_requestId === undefined) {
        this.popupType = middlewaretypes.PopupRequestType.CONFIRMATION
        this.popupRequest = middlewaretypes.RpcMethod.ETH_REQUEST_ACCOUNTS
        this.popupRequestId = 0
        this.popupOrigin = ''
        this.popupPrivData = undefined
        this.popupUpdated = false
        return
      }
      const popup = this.popups.get(_requestId) as BexPayload<
        commontypes.PopupRequest,
        unknown
      >
      if (!popup) {
        this.activateRequest()
        return
      }
      this.popupType = popup.data.type
      this.popupRequest = popup.data.request.request
        .method as middlewaretypes.RpcMethod
      this.popupRequestId = _requestId
      this.popupOrigin = popup.data.request.origin
      this.popupPrivData = popup.data.privData
      this.popupUpdated = popup.data.privData !== undefined
    },
    insertRequest(payload: BexPayload<commontypes.PopupRequest, unknown>) {
      const requestId = Number(payload.data.request.request.id)
      this.popups.set(requestId, payload)
      if (!this.popupRequestId || !this.popups.has(this.popupRequestId)) {
        this.activateRequest(requestId)
      }
    },
    updateRequest(payload: BexPayload<commontypes.PopupRequest, unknown>) {
      const requestId = Number(payload.data.request.request.id)
      if (!this.popups.has(requestId)) {
        return false
      }
      this.popups.set(requestId, payload)
      if (this.popupRequestId !== requestId) {
        return true
      }
      this.popupPrivData = payload.data.privData
      this.popupUpdated = true
      return true
    },
    removeRequest(requestId: number) {
      this.popups.delete(requestId)
      if (this.popupRequestId === requestId) {
        this.activateRequest()
      }
    },
    addConnection(connection: ConnectionInfo) {
      this.connections.set(connection.origin, connection)
    },
    async rejectAllRequests(message = 'Canceled by user') {
      const popups = Array.from(this.popups.values()) as Array<
        BexPayload<commontypes.PopupRequest, unknown>
      >
      for (const popup of popups) {
        await popup.respond({
          code: -1,
          message
        } as commontypes.PopupResponse)
      }
      this.popups.clear()
      this.activateRequest()
    }
  }
})
