<script setup lang='ts'>
import { dbWallet } from '../../../controller'

const createApplicationCreatorChainSubscription = async (microchain: string, applicationId: string) => {
  await dbWallet.applicationCreatorChainSubscriptions.add({
    microchain,
    applicationId
  })
}

const applicationCreatorChainSubscribed = async (microchain: string, applicationId: string) => {
  return (await dbWallet.applicationCreatorChainSubscriptions.toArray()).findIndex((el) => el.microchain === microchain && el.applicationId === applicationId) > 0
}

defineExpose({
  createApplicationCreatorChainSubscription,
  applicationCreatorChainSubscribed
})

</script>
