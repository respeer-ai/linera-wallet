import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'
import { dbBridge } from 'src/bridge'
import { dbModel } from 'src/model'

export class ChainOperationHelper {
  static executedInBlock = async (
    microchain: string,
    block: ConfirmedBlock
  ) => {
    const operations = await dbBridge.ChainOperation.chainOperations(
      0,
      0,
      microchain,
      [dbModel.OperationState.EXECUTING, dbModel.OperationState.EXECUTED],
      block.hash as string
    )
    let needRetry = false
    for (const operation of operations) {
      if (operation.state !== dbModel.OperationState.EXECUTED) {
        needRetry = true
      }
      operation.state = dbModel.OperationState.CONFIRMED
      await dbBridge.ChainOperation.update(operation)
    }
    return needRetry
  }

  static executingOperation = async (operationId: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    operation.state = dbModel.OperationState.EXECUTING
    operation.lastErrorAt = operation.errorAt
    operation.errorAt = 0
    await dbBridge.ChainOperation.update(operation)
  }

  static submittedWithHash = async (
    operationId: string,
    certificateHash: string
  ) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    operation.state = dbModel.OperationState.EXECUTED
    operation.certificateHash = certificateHash
    await dbBridge.ChainOperation.update(operation)
  }

  static tryFirstProcessOperation = async (operationId: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    if (!operation.firstProcessedAt) {
      operation.firstProcessedAt = Date.now()
      await dbBridge.ChainOperation.update(operation)
    }
  }

  static inflightOperations = async () => {
    return await ChainOperationHelper.statedOperations([
      dbModel.OperationState.EXECUTED
    ])
  }

  static initialOperations = async () => {
    return await ChainOperationHelper.statedOperations([
      dbModel.OperationState.CREATED
    ])
  }

  static errorOperations = async () => {
    return await ChainOperationHelper.statedOperations(
      [dbModel.OperationState.EXECUTING],
      true
    )
  }

  static statedOperations = async (
    states: dbModel.OperationState[],
    error?: boolean
  ) => {
    return await dbBridge.ChainOperation.chainOperations(
      0,
      0,
      undefined,
      states,
      undefined,
      error
    )
  }

  static failOperation = async (operationId: string, e: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    operation.state = dbModel.OperationState.FAILED
    operation.failedAt = Date.now()
    operation.failReason = e
    await dbBridge.ChainOperation.update(operation)
  }

  static errorOperation = async (operationId: string, e: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    operation.errorAt = Date.now()
    operation.failReason = e
    await dbBridge.ChainOperation.update(operation)
  }

  static tryTimeoutOperation = async (operationId: string, e: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return true

    if (!operation.firstProcessedAt) {
      if (operation.createdAt + 60 * 1000 < Date.now()) {
        await ChainOperationHelper.failOperation(operationId, e)
        return
      }
      await ChainOperationHelper.errorOperation(operationId, e)
      return
    }

    if (operation.firstProcessedAt + 10 * 1000 < Date.now()) {
      await ChainOperationHelper.failOperation(operationId, e)
    }
  }
}
