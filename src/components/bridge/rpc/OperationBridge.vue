<script setup lang='ts'>
import { uid } from 'quasar'
import { db, rpc } from 'src/model'
import { ref} from 'vue'
import ChainOperationBridge from '../bridge/db/ChainOperationBridge.vue'

const chainOperationBridge = ref<InstanceType<typeof ChainOperationBridge>>()

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number) => {
  const fromOwner = fromPublicKey !== undefined ? await db.ownerFromPublicKey(fromPublicKey) : undefined
  const toOwner = toPublicKey !== undefined ? await db.ownerFromPublicKey(toPublicKey) : undefined

  const operation = {
    operationType: db.OperationType.TRANSFER,
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
  } as db.ChainOperation
  await chainOperationBridge.value?.createChainOperation({ ...operation })
}

const requestApplication = (requesterChainId: string, applicationId: string, targetChainId: string, applicationType: db.ApplicationType) => {
  const operation = {
    operationType: db.OperationType.REQUEST_APPLICATION,
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
  } as db.ChainOperation
  chainOperationBridge.value?.createNetwork({ ...operation })
}

defineExpose({
  transfer,
  requestApplication
})

</script>
