import { dbModel, rpcModel } from '../../model'

export enum OperationType {
  TRANSFER = 'transfer'
}

export interface ChainOperation {
  operationType?: OperationType
  applicationType?: dbModel.ApplicationType
  operationId: string
  microchain: string
  operation: rpcModel.Operation
}
