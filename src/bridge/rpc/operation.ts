import { v4 as uuidv4 } from 'uuid'
import { db, rpc } from 'src/model'
import { dbBridge } from '..'
import { stringify } from 'lossless-json'

export class Operation {
  static transfer = async (
    fromPublicKey: string | undefined,
    fromChainId: string,
    toPublicKey: string | undefined,
    toChainId: string,
    amount: number
  ): Promise<string> => {
    const fromOwner =
      fromPublicKey !== undefined
        ? await db.ownerFromPublicKey(fromPublicKey)
        : undefined
    const toOwner =
      toPublicKey !== undefined
        ? await db.ownerFromPublicKey(toPublicKey)
        : undefined
    let amountStr = stringify(amount) || '0'
    if (Number(amountStr) === 0) return Promise.reject('Invalid amount')
    if (!amountStr?.endsWith('.') && !amountStr?.includes('.')) {
      amountStr += '.'
    }

    const operationId = uuidv4()

    const operation = {
      operationType: db.OperationType.TRANSFER,
      operationId,
      microchain: fromChainId,
      operation: stringify({
        System: {
          Transfer: {
            owner: fromOwner,
            recipient: {
              Account: {
                chain_id: toChainId,
                owner: toOwner
              }
            },
            amount: amountStr
          }
        }
      } as rpc.Operation)
    } as db.ChainOperation
    await dbBridge.ChainOperation.create({ ...operation })
    return operationId
  }

  static async waitOperation(operationId: string): Promise<boolean> {
    const operation = (await dbBridge.ChainOperation.get(
      operationId
    )) as db.ChainOperation
    if (!operation) return Promise.reject('Invalid operation')

    // TODO: will the operation never confirmed ?
    if (operation?.state >= db.OperationState.CONFIRMED)
      return operation?.state !== db.OperationState.FAILED

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Operation.waitOperation(operationId)
          .then((success) => {
            resolve(success)
          })
          .catch((e) => {
            reject(e)
          })
      }, 1000)
    })
  }
}
