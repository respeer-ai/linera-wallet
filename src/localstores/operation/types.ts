import { db, rpc } from '../../model'

export enum OperationType {
  TRANSFER = 'transfer'
}

export interface ChainOperation {
  operationType?: OperationType
  applicationType?: db.ApplicationType
  operationId: string
  microchain: string
  operation: rpc.Operation
}
