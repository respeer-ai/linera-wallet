import { uid } from 'quasar'
import { db, rpc } from 'src/model'
import { dbBridge } from '..'
import { ApplicationOperation } from './application_operation'

export class Operation {
  static transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number) => {
    const fromOwner = fromPublicKey !== undefined ? await db.ownerFromPublicKey(fromPublicKey) : undefined
    const toOwner = toPublicKey !== undefined ? await db.ownerFromPublicKey(toPublicKey) : undefined

    const operation = {
      operationType: db.OperationType.TRANSFER,
      operationId: uid(),
      microchain: fromChainId,
      operation: JSON.stringify({
        System: {
          Transfer: {
            owner: fromOwner,
            recipient: {
              Account: {
                chain_id: toChainId,
                owner: toOwner
              }
            },
            amount: amount.toString()
          }
        }
      } as rpc.Operation)
    } as db.ChainOperation
    await dbBridge.ChainOperation.create({ ...operation })
  }

  static requestApplication = async (requesterChainId: string, applicationId: string, targetChainId: string, applicationType: db.ApplicationType) => {
    const exist = await ApplicationOperation.existChainApplication(targetChainId, applicationId)
    if (!exist) return

    const operation = {
      operationType: db.OperationType.REQUEST_APPLICATION,
      applicationType,
      operationId: uid(),
      microchain: requesterChainId,
      operation: JSON.stringify({
        System: {
          RequestApplication: {
            application_id: applicationId,
            chain_id: targetChainId
          }
        }
      } as rpc.Operation)
    } as db.ChainOperation
    await dbBridge.ChainOperation.create({ ...operation })
  }
}
