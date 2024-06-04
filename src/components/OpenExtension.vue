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
</template>

<script setup lang='ts'>
const onOpenExtensionClick = () => {
  window.linera.request({
    method: 'test-message'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log(e)
  })
}
</script>
