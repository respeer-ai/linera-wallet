<template>
  <LineraMutationTransfer purpose='For Subscription' />
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue'

import LineraMutationTransfer from './LineraMutationTransfer.vue'

const subscriptionId = ref(undefined as unknown as string)

const subscriptionHandler = (msg: unknown) => {
  console.log('Subscription', msg)
}

onMounted(() => {
  if (subscriptionId.value) return
  window.linera?.request({
    method: 'linera_subscribe'
  }).then((_subscriptionId) => {
    subscriptionId.value = _subscriptionId as string
    window.linera.on('message', subscriptionHandler)
  }).catch((e) => {
    console.log('Fail subscribe', e)
  })
})

onUnmounted(() => {
  if (!subscriptionId.value) return
  void window.linera?.request({
    method: 'linera_unsubscribe',
    params: [subscriptionId.value]
  })
  subscriptionId.value = undefined as unknown as string
})

</script>
