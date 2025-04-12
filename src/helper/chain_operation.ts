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

  static firstProcessOperation = async (operationId: string) => {
    const operation = await dbBridge.ChainOperation.get(operationId)
    if (!operation) return
    if (!operation.firstProcessedAt) {
      operation.firstProcessedAt = Date.now()
      await dbBridge.ChainOperation.update(operation)
    }
  }

  static inflightOperations = async () => {
    return await ChainOperationHelper.statedOperations([
      dbModel.OperationState.CREATED,
      dbModel.OperationState.EXECUTING,
      dbModel.OperationState.EXECUTED
    ])
  }

  static statedOperations = async (states: dbModel.OperationState[]) => {
    return await dbBridge.ChainOperation.chainOperations(
      0,
      0,
      undefined,
      states
    )
  }

  static timeoutOperation = async (operationId: string, e: string) => {
    if (JSON.stringify(e)?.includes('Was expecting block height')) {
      return false
    }
    if (
      JSON.stringify(e)?.includes(
        'is out of order compared to previous messages from'
      )
    ) {
      return false
    }

    const operation = await dbBridge.ChainOperation.get(operationId)

    if (!operation?.firstProcessedAt) return false

    if (operation.firstProcessedAt + 10 * 1000 < Date.now()) {
      operation.state = dbModel.OperationState.FAILED
      operation.failedAt = Date.now()
      operation.failReason = e
      await dbBridge.ChainOperation.update(operation)
      return true
    }

    return false
  }
}
