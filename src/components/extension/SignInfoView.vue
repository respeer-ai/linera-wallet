<template>
  <q-card
    flat class='full-width text-left full-hight page-x-padding page-y-padding word-break-all overflow-scroll'
  >
    <div class='text-black text-bold label-text-middle'>
      Account
    </div>
    <div class='vertical-items-margin'>
      {{ publicKey }}
    </div>
    <div class='text-black text-bold label-text-middle vertical-menus-margin'>
      Content
    </div>
    <div class='vertical-items-margin'>
      {{ utf8Content }}
    </div>
    <div class='text-black text-bold label-text-middle  vertical-menus-margin'>
      Encoded
    </div>
    <div class='vertical-items-margin'>
      {{ hexContent }}
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { toRef } from 'vue'

interface Props {
  publicKey: string
  utf8Content: string
  hexContent: string
}
const props = defineProps<Props>()
const publicKey = toRef(props, 'publicKey')
const utf8Content = toRef(props, 'utf8Content')
const hexContent = toRef(props, 'hexContent')

</script>
