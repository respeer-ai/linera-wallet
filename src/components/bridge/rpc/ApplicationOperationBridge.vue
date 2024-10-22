<script setup lang='ts'>
import { localStore, operationDef } from 'src/localstores'
import { rpc } from 'src/model'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const queryApplication = async (chainId: string, applicationId: string, query: string): Promise<Int8Array> => {
  // TODO: query application, for query itself or mutation
  return Promise.resolve(new Int8Array())
}

const subscribeCreatorChain = async (chainId: string, applicationId: string) => {
  const queryRespBytes = await queryApplication(chainId, applicationId, '')

  localStore.operation.operations.push({
    microchain: chainId,
    operation: {
      User: {
        application_id: applicationId,
        bytes: queryRespBytes
      }
    } as rpc.Operation
  } as operationDef.ChainOperation)
}

defineExpose({
  queryApplication,
  subscribeCreatorChain
})

</script>
