import { dbWallet } from 'src/controller'
import { db } from 'src/model'

export class ChainOperation {
  static create = async (chainOperation: db.ChainOperation) => {
    chainOperation.state = db.OperationState.CREATED
    chainOperation.createdAt = Date.now()
    await dbWallet.chainOperations.add(chainOperation)
  }

  static get = async (
    operationId: string
  ): Promise<db.ChainOperation | undefined> => {
    return await dbWallet.chainOperations
      .where('operationId')
      .equals(operationId)
      .first()
  }

  static count = async (microchain?: string, states?: db.OperationState[]) => {
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
    states?: db.OperationState[],
    stateHash?: string
  ): Promise<db.ChainOperation[]> => {
    return await dbWallet.chainOperations
      .filter(
        (op) =>
          (!microchain || op.microchain === microchain) &&
          (!stateHash || op.stateHash === stateHash) &&
          (states === undefined ||
            states.length === 0 ||
            states.includes(op.state))
      )
      .offset(offset)
      .limit(limit || 9999)
      .toArray()
  }

  static update = async (chainOperation: db.ChainOperation) => {
    await dbWallet.chainOperations.update(chainOperation.id, chainOperation)
  }

  static delete = async (id: number) => {
    await dbWallet.chainOperations.delete(id)
  }

  static exists = async (
    microchain: string,
    operationType: db.OperationType,
    applicationId?: string,
    states?: db.OperationState[],
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
}
