<script setup lang='ts'>
import { dbWallet } from '../../../controller'

const applicationCreatorChainSubscribed = async (microchain: string, applicationId: string) => {
  return (await dbWallet.applicationCreatorChainSubscriptions.toArray()).findIndex((el) => el.microchain === microchain && el.applicationId === applicationId) >= 0
}

const createApplicationCreatorChainSubscription = async (microchain: string, applicationId: string) => {
  if (await applicationCreatorChainSubscribed(microchain, applicationId)) return
  await dbWallet.applicationCreatorChainSubscriptions.add({
    microchain,
    applicationId
  })
}

defineExpose({
  createApplicationCreatorChainSubscription,
  applicationCreatorChainSubscribed
})

</script>
