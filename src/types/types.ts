import * as middlewaretypes from '../../src-bex/middleware/types'

export interface PopupRequest {
  type: middlewaretypes.PopupRequestType
  request: middlewaretypes.RpcRequest
  privData?: unknown
}

export interface PopupResponse {
  code: number
  message?: string
}
