<template>
  <div class='cursor-pointer like-link'>
    {{ $t('MSG_TESTNET_MUST_READ') }}
    <q-popup-proxy>
      <q-card
        class='text-brown-10'
        :style='{ padding: "24px", maxWidth: "640px" }'
      >
        <div v-html='$t("MSG_TESTNET_MUST_READ_CONTENT")' />
      </q-card>
    </q-popup-proxy>
  </div>
</template>

<script setup lang='ts'>
</script>
