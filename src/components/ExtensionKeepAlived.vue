<script setup lang='ts'>
import { onMounted, onUnmounted, ref } from 'vue'

const keepAlivedInterval = ref(-1)

onMounted(() => {
  keepAlivedInterval.value = window.setInterval(() => {
    window.linera && window.linera.request({
      method: 'checko_ping'
    }).then((pong) => {
      console.debug('Success ping', pong)
    }).catch((e) => {
      console.error('Fail ping', e)
    })
  }, 10000)
})

onUnmounted(() => {
  if (keepAlivedInterval.value >= 0) {
    window.clearInterval(keepAlivedInterval.value)
    keepAlivedInterval.value = -1
  }
})
</script>
