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
    label='Linera Graphql Query'
    @click='onLineraGraphqlQueryClick'
    class='text-brown-10'
    :style='{
      width: "100%",
      marginTop: "8px"
    }'
  />
  <q-btn
    outline
    rounded
    label='Linera Graphql Mutation'
    @click='onLineraGraphqlMutationClick'
    class='text-brown-10'
    :style='{
      width: "100%",
      marginTop: "8px"
    }'
  />
</template>

<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue'

const onOpenExtensionClick = () => {
  window.linera.request({
    method: 'eth_requestAccounts'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}

const onLineraGraphqlQueryClick = () => {
  window.linera.request({
    method: 'linera_graphqlQuery'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}

const onLineraGraphqlMutationClick = () => {
  window.linera.request({
    method: 'linera_graphqlMutation'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}

const subscriptionHandler = (msg: unknown) => {
  console.log('Subscription', msg)
}

const subscriptionId = ref(undefined as unknown as string)

onMounted(() => {
  window.linera.request({
    method: 'linera_subscribe'
  }).then((_subscriptionId) => {
    subscriptionId.value = _subscriptionId as string
    window.linera.on('message', subscriptionHandler)
  }).catch((e) => {
    console.log('Fail subscribe', e)
  })
})

onUnmounted(() => {
  if (subscriptionId.value) {
    void window.linera.request({
      method: 'linera_unsubscribe',
      params: [subscriptionId.value]
    })
  }
})
</script>
