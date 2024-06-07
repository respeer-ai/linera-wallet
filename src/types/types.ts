import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'

export enum PopupRequestType {
  CONFIRMATION = 'confirmation'
}

export interface PopupRequest {
  type: PopupRequestType
  request: JsonRpcRequest<JsonRpcParams>
}
