<script setup lang='ts'>
import { db } from '../../../model'
import { dbWallet } from '../../../controller'

const createChainOperation = async (chainOperation: db.ChainOperation) => {
  await dbWallet.chainOperations.add(chainOperation)
}

const getChainOperation = async (operationId: string): Promise<db.ChainOperation | undefined> => {
  return await dbWallet.chainOperations.where('operationId').equals(operationId).first()
}

const getChainOperations = async (): Promise<db.ChainOperation[]> => {
  return await dbWallet.chainOperations.toArray()
}

const deleteChainOperation = async (id: number) => {
  await dbWallet.chainOperations.delete(id)
}

defineExpose({
  createChainOperation,
  deleteChainOperation,
  getChainOperation,
  getChainOperations
})

</script>
