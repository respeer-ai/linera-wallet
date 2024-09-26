<template>
  <div class='text-center full-width'>
    <div>
      <div class='text-bold label-text-large'>
        Select Linera account
      </div>
      <q-resize-observer @resize='onHeaderResize' />
    </div>
    <div
      :style='{
        height: "calc(100% - " + headerHeight + "px" + ")"
      }'
      class='flex justify-center items-center page-y-padding label-radius'
    >
      <q-card :style='{padding: owners.length ? "" : "48px 24px"}' class='full-width'>
        <div v-if='owners.length' class='full-width'>
          <q-radio
            v-model='publicKey'
            v-for='(owner, index) in owners'
            :key='owner.address'
            :val='owner.address'
            :style='{
              borderBottom: index < owners.length - 1 ? "1px solid grey" : "",
            }'
            class='cursor-pointer full-width page-x-padding page-y-padding'
          >
            <div class='row'>
              <q-img :src='lineraLogo' width='36px' height='36px' />
              <div :style='{margin: "0 0 0 16px"}' class='text-left'>
                <div class='text-bold label-text-large'>
                  {{ shortid.shortId(owner.address, 6) }}
                </div>
                <div class='text-brown-6'>
                  {{ 0.00 }} TLINERA
                </div>
              </div>
            </div>
          </q-radio>
        </div>
        <div v-else class='row full-width'>
          <q-space />
          <div :style='{lineHeight: "36px"}'>
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
    <OwnerBridge v-model:owners='owners' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { shortid } from 'src/utils'
import { db } from 'src/model'

import OwnerBridge from '../../bridge/db/OwnerBridge.vue'

import lineraLogo from '../../../assets/LineraLogo.png'

const owners = ref([] as db.Owner[])
const publicKey = ref('')

interface Size {
  width: number
  height: number
}

const headerHeight = ref(0)

const onHeaderResize = (size: Size) => {
  headerHeight.value = size.height
}
</script>
