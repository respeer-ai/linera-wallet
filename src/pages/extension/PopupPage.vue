<template>
  <div>popup页面</div>
  <div>数据: {{ data }}</div>
  <q-input type='text' v-model='text' />
  <q-btn @click='sendDataBack'>
    Send Data Back to Webpage
  </q-btn>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const data = ref({})
// 请求 background.js 提供数据
chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
  if (response) {
    console.log('Data received in popup:', response)
    data.value = JSON.stringify(response, null, 2)
  }
})

const text = ref('')
// 把消息返回给Webpage
const sendDataBack = () => {
  void chrome.runtime.sendMessage({ type: 'RESULT_FROM_POPUP', data: { Message: text } })
}
</script>
