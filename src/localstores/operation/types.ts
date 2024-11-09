import { db, rpc } from '../../model'

export enum OperationType {
  LEGACY_REQUEST_SUBSCRIBE = 'requestSubscribe',
  SUBSCRIBE_CREATOR_CHAIN = 'subscribeCreatorChain',
  REQUEST_APPLICATION = 'requestApplication',
  TRANSFER = 'transfer',
  MINT = 'mint'
}

export interface ChainOperation {
  operationType?: OperationType
  applicationType?: db.ApplicationType
  operationId: string
  microchain: string
  operation: rpc.Operation
}
