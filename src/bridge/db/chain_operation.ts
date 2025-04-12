import { dbWallet } from 'src/controller'
import { dbModel } from 'src/model'

export class ChainOperation {
  static create = async (chainOperation: dbModel.ChainOperation) => {
    chainOperation.state = dbModel.OperationState.CREATED
    chainOperation.createdAt = Date.now()
    await dbWallet.chainOperations.add(chainOperation)
  }

  static get = async (
    operationId: string
  ): Promise<dbModel.ChainOperation | undefined> => {
    return await dbWallet.chainOperations
      .where('operationId')
      .equals(operationId)
      .first()
  }

  static count = async (
    microchain?: string,
    states?: dbModel.OperationState[]
  ) => {
    return await dbWallet.chainOperations
      .filter(
        (op) =>
          (!microchain || op.microchain === microchain) &&
          (states === undefined ||
            states.length === 0 ||
            states.includes(op.state))
      )
      .count()
  }

  static chainOperations = async (
    offset: number,
    limit: number,
    microchain?: string,
    states?: dbModel.OperationState[],
    certificateHash?: string
  ): Promise<dbModel.ChainOperation[]> => {
    return await dbWallet.chainOperations
      .filter(
        (op) =>
          (!microchain || op.microchain === microchain) &&
          (!certificateHash || op.certificateHash === certificateHash) &&
          (states === undefined ||
            states.length === 0 ||
            states.includes(op.state))
      )
      .offset(offset)
      .limit(limit || 9999)
      .toArray()
  }

  static update = async (chainOperation: dbModel.ChainOperation) => {
    await dbWallet.chainOperations.update(chainOperation.id, chainOperation)
  }

  static delete = async (id: number) => {
    await dbWallet.chainOperations.delete(id)
  }

  static exists = async (
    microchain: string,
    operationType: dbModel.OperationType,
    applicationId?: string,
    states?: dbModel.OperationState[],
    createdBefore?: number,
    createdAfter?: number
  ) => {
    return (
      (await dbWallet.chainOperations
        .where('microchain')
        .equals(microchain)
        .and((op) => op.operationType === operationType)
        .and((op) => !applicationId || op.applicationId === applicationId)
        .and((op) => !states?.length || states.includes(op.state))
        .and(
          (op) =>
            createdBefore === undefined || (op.createdAt || 0) <= createdBefore
        )
        .and(
          (op) =>
            createdAfter === undefined || (op.createdAt || 0) > createdAfter
        )
        .first()) !== undefined
    )
  }

  static operationBlobs = async (operationId: string) => {
    return (
      await dbWallet.operationBlobs
        .where('operationId')
        .equals(operationId)
        .toArray()
    ).map((blob) => blob.blob)
  }
}
