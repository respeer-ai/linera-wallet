<script setup lang='ts'>
import { localStore, operationDef } from 'src/localstores'
import { db, rpc } from 'src/model'

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number) => {
  const fromOwner = fromPublicKey !== undefined ? await db.ownerFromPublicKey(fromPublicKey) : undefined
  const toOwner = toPublicKey !== undefined ? await db.ownerFromPublicKey(toPublicKey) : undefined

  localStore.operation.operations.push({
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

const requestApplication = (chainId: string, applicationId: string, targetChainId: string) => {
  localStore.operation.operations.push({
    microchain: chainId,
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
