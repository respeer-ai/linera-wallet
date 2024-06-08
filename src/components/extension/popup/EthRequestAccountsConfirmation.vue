<template>
  <div class='text-center' :style='{height: "100%"}'>
    <div>
      <div class='text-bold text-brown-10' :style='{fontSize: "24px", margin: "24px 0 0 0"}'>
        Connect to CheCko
      </div>
      <div class='text-brown-6' :style='{fontSize: "20px"}'>
        Select account for connection
      </div>
      <q-resize-observer @resize='onHeaderResize' />
    </div>
    <div
      :style='{
        padding: "36px 0 36px 0",
        borderRadius: "16px",
        height: "calc(100% - " + (headerHeight + actionHeight) + "px" + ")"
      }'
      class='flex justify-center items-center'
    >
      <q-card :style='{width: "100%", padding: publicKeys.length ? "" : "48px 24px"}'>
        <div v-if='publicKeys.length' :style='{width: "100%"}'>
          {{ publicKeys }}
        </div>
        <div v-else :style='{width: "100%"}' class='row'>
          <q-space />
          <div :style='{lineHeight: "24px"}'>
            No account available.
          </div>
          <q-btn
            dense
            flat
            class='text-blue-6'
          >
            Create
          </q-btn>
          <q-space />
        </div>
      </q-card>
    </div>
    <div>
      <div class='text-brown-6' :style='{fontSize: "16px"}'>
        Only approve trusted application
      </div>
      <q-btn
        flat
        dense
        rounded
        label='Continue'
        class='text-brown-10 bg-red-2'
        :style='{
          margin: "16px 0 8px 0",
          width: "100%"
        }'
        @click='onNextStepClick'
      />
      <q-btn
        flat
        dense
        rounded
        outlined
        label='Cancel'
        class='text-brown-10'
        :style='{
          margin: "8px 0 16px 0",
          width: "100%"
        }'
        @click='onNextStepClick'
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { wallet } from 'src/localstores'
import { computed, ref } from 'vue'

const _wallet = wallet.useWalletStore()
const publicKeys = computed(() => _wallet.publicKeys)

const onNextStepClick = () => {
  // TODO
}

interface Size {
  width: number
  height: number
}

const headerHeight = ref(0)
const actionHeight = ref(0)

const onHeaderResize = (size: Size) => {
  headerHeight.value = size.height
}
const onActionResize = (size: Size) => {
  actionHeight.value = size.height
}

</script>
