<template>
  <q-btn
    outline
    rounded
    label='Open Extension'
    @click='onOpenExtensionClick'
    class='text-brown-10'
    :style='{
      width: "100%"
    }'
  />
  <q-btn
    outline
    rounded
    label='Linera Graphql DO'
    @click='onLineraGraphqlDoClick'
    class='text-brown-10'
    :style='{
      width: "100%"
    }'
  />
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted } from 'vue'

const onOpenExtensionClick = () => {
  window.linera.request({
    method: 'eth_requestAccounts'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}

const onLineraGraphqlDoClick = () => {
  window.linera.request({
    method: 'linera_graphqlQuery'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}

const subscriptionHandler = (ev: MessageEvent) => {
  // TODO: We should use notification in provider window.linera.on('message')
  const data = ((ev.data as Record<string, unknown>).data as Record<string, unknown>)?.data as Record<string, unknown>
  if (!data) {
    return
  }
  if (data.method !== 'linera_subscription') {
    return
  }
  console.log(4, data)
}

onMounted(() => {
  window.addEventListener('message', subscriptionHandler)
})

onUnmounted(() => {
  window.removeEventListener('message', subscriptionHandler)
})
</script>
