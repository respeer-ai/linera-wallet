import { rpc } from '../../model'

export enum OperationType {
  SUBSCRIBE_CREATOR_CHAIN = 'subscribeCreatorChain'
}

export interface ChainOperation {
  operation_type?: OperationType
  operation_id: string
  microchain: string
  operation: rpc.Operation
}
