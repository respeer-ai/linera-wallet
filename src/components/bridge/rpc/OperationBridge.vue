<script setup lang='ts'>
import { uid } from 'quasar'
import { localStore, operationDef } from 'src/localstores'
import { db, rpc } from 'src/model'

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number) => {
  const fromOwner = fromPublicKey !== undefined ? await db.ownerFromPublicKey(fromPublicKey) : undefined
  const toOwner = toPublicKey !== undefined ? await db.ownerFromPublicKey(toPublicKey) : undefined

  localStore.operation.operations.push({
    operationType: operationDef.OperationType.TRANSFER,
    operationId: uid(),
    microchain: fromChainId,
    operation: {
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
    } as rpc.Operation
  } as operationDef.ChainOperation)
}

const requestApplication = (requesterChainId: string, applicationId: string, targetChainId: string, applicationType: db.ApplicationType) => {
  localStore.operation.operations.push({
    operationType: operationDef.OperationType.REQUEST_APPLICATION,
    applicationType,
    operationId: uid(),
    microchain: requesterChainId,
    operation: {
      System: {
        RequestApplication: {
          application_id: applicationId,
          chain_id: targetChainId
        }
      }
    } as rpc.Operation
  } as operationDef.ChainOperation)
}

defineExpose({
  transfer,
  requestApplication
})

</script>
