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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  window.postMessage('test-message')
}
</script>
