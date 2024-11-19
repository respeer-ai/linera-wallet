<template>
  <q-card
    flat class='full-width text-left full-hight page-x-padding page-y-padding word-break-all overflow-scroll'
  >
    <div class='text-black text-bold label-text-middle'>
      {{ $t('MSG_ACCOUNT') }}
    </div>
    <div class='vertical-items-margin'>
      {{ publicKey }}
    </div>
    <div class='text-black text-bold label-text-middle vertical-menus-margin'>
      {{ $t('MSG_APPLICATION_ID') }}
    </div>
    <div class='vertical-items-margin'>
      {{ applicationId }}
    </div>
    <div class='text-black text-bold label-text-middle vertical-menus-margin'>
      {{ $t('MSG_MICROCHAIN_ID') }}
    </div>
    <div class='vertical-items-margin'>
      {{ microchainId }}
    </div>
    <div class='text-black text-bold label-text-middle  vertical-menus-margin'>
      {{ $t('MSG_QUERY') }}
    </div>
    <div class='vertical-items-margin'>
      {{ graphqlQuery }}
    </div>
    <div class='text-black text-bold label-text-middle  vertical-menus-margin'>
      {{ $t('MSG_VARIABLES') }}
    </div>
    <div class='vertical-items-margin'>
      {{ JSON.stringify(graphqlVariables, null, 2) }}
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { toRef } from 'vue'

interface Props {
  publicKey: string
  applicationId: string
  microchainId: string
  graphqlQuery: string
  graphqlVariables: Record<string, unknown>
}
const props = defineProps<Props>()
const publicKey = toRef(props, 'publicKey')
const applicationId = toRef(props, 'applicationId')
const microchainId = toRef(props, 'microchainId')
const graphqlQuery = toRef(props, 'graphqlQuery')
const graphqlVariables = toRef(props, 'graphqlVariables')

</script>
