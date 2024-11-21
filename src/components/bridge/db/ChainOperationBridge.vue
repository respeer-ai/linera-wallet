<script setup lang='ts'>
import { db } from '../../../model'
import { dbWallet } from '../../../controller'

const createChainOperation = async (chainOperation: db.ChainOperation) => {
  chainOperation.state = db.OperationState.CREATED
  chainOperation.createdAt = Date.now()
  await dbWallet.chainOperations.add(chainOperation)
}

const getChainOperation = async (operationId: string): Promise<db.ChainOperation | undefined> => {
  return await dbWallet.chainOperations.where('operationId').equals(operationId).first()
}

const chainOperationsCount = async (microchain?: string, states?: db.OperationState[]) => {
  return await dbWallet.chainOperations.filter((op) => (!microchain || op.microchain === microchain) && (states === undefined || states.length === 0 || states.includes(op.state))).count()
}

const getChainOperations = async (offset: number, limit: number, microchain?: string, states?: db.OperationState[]): Promise<db.ChainOperation[]> => {
  return await dbWallet.chainOperations.filter((op) => (!microchain || op.microchain === microchain) && (states === undefined || states.length === 0 || states.includes(op.state))).offset(offset).limit(limit || 9999).toArray()
}

const updateChainOperation = async (chainOperation: db.ChainOperation) => {
  await dbWallet.chainOperations.update(chainOperation.id, chainOperation)
}

const deleteChainOperation = async (id: number) => {
  await dbWallet.chainOperations.delete(id)
}

const existChainOperation = async (microchain: string, operationType: db.OperationType, applicationId?: string) => {
  return await dbWallet.chainOperations.where('microchain').equals(microchain).and((op) => op.operationType === operationType).and((op) => !applicationId || op.applicationId === applicationId).first() !== undefined
}

defineExpose({
  createChainOperation,
  deleteChainOperation,
  updateChainOperation,
  getChainOperation,
  getChainOperations,
  existChainOperation,
  chainOperationsCount
})

</script>
