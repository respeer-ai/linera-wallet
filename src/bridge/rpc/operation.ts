import { v4 as uuidv4 } from 'uuid'
import { db, rpc } from 'src/model'
import { dbBridge } from '..'
import { ApplicationOperation } from './application_operation'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { stringify } from 'lossless-json'

export class Operation {
  static transfer = async (
    fromPublicKey: string | undefined,
    fromChainId: string,
    toPublicKey: string | undefined,
    toChainId: string,
    amount: number
  ) => {
    const fromOwner =
      fromPublicKey !== undefined
        ? await db.ownerFromPublicKey(fromPublicKey)
        : undefined
    const toOwner =
      toPublicKey !== undefined
        ? await db.ownerFromPublicKey(toPublicKey)
        : undefined

    const operation = {
      operationType: db.OperationType.TRANSFER,
      operationId: uuidv4(),
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
            amount: stringify(amount)
          }
        }
      } as rpc.Operation)
    } as db.ChainOperation
    await dbBridge.ChainOperation.create({ ...operation })
  }

  static requestApplication = async (
    requesterChainId: string,
    applicationId: string,
    applicationType: db.ApplicationType
  ): Promise<string | undefined> => {
    // TODO: load application creation chain in our rpc endpoint firstly

    const creationChainId = await lineraWasm.application_creation_chain_id(
      applicationId
    )

    /*
    let exist = await ApplicationOperation.existChainApplication(
      creationChainId,
      applicationId
    )
    if (!exist) return Promise.reject('Application not exists')
    */

    const exist = await ApplicationOperation.existChainApplication(
      requesterChainId,
      applicationId
    )
    if (exist) return undefined

    const operationId = uuidv4()
    const operation = {
      operationType: db.OperationType.REQUEST_APPLICATION,
      applicationType,
      operationId,
      microchain: requesterChainId,
      operation: JSON.stringify({
        System: {
          RequestApplication: {
            application_id: applicationId,
            chain_id: creationChainId
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
            setTimeout(() => resolve(success), 1000)
          })
          .catch((e) => {
            reject(e)
          })
      }, 1000)
    })
  }
}
