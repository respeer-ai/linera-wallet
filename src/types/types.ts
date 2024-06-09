import * as middlewaretypes from '../../src-bex/middleware/types'

export interface PopupRequest {
  type: middlewaretypes.PopupRequestType
  request: middlewaretypes.RpcRequest
}

export interface ConfirmationPopupResponse {
  approved: boolean
  message?: string
}
