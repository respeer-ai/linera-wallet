<template>
  <div>
    <q-btn
      label='Get provider state' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>

const onRun = () => {
  window.linera?.request({
    method: 'metamask_getProviderState'
  }).then((result) => {
    console.log(result)
  }).catch((e) => {
    console.log('metamask_getProviderState', e)
  })
}

</script>
