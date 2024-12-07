<template>
  <div>
    <div class='text-grey-6 vertical-sections-margin'>
      {{ $t('MSG_TRANSFER') }}
    </div>
    <div class='row flex items-center vertical-items-margin extra-margin-bottom'>
      <q-avatar>
        <q-img :src='tokenLogo' width='48px' height='48px' fit='contain' />
      </q-avatar>
      <div class='selector-margin-x-left'>
        <div class='label-text-extra-large'>
          {{ amount }} {{ token.ticker }}
        </div>
        <div class='text-grey-6' :style='{marginTop: "-4px"}'>
          ≈ $ 0.00
        </div>
      </div>
    </div>
    <div class='page-y-padding'>
      <div class='text-grey-6'>
        {{ $t('MSG_FROM') }} <span class='like-link'>{{ fromChainBalance ? 'chain balance' : 'account balance' }}</span>
      </div>
      <q-btn-dropdown
        flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin'
        no-caps dense
        dropdown-icon='none'
        menu-anchor='bottom left'
        menu-self='top left'
      >
        <template #label>
          <div class='row full-width'>
            <q-avatar>
              <q-img v-if='fromOwner' :src='db.ownerAvatar(fromOwner)' width='36px' height='36px' />
            </q-avatar>
            <div v-if='fromOwner' class='header-items-margin-x-left text-left'>
              <div>
                {{ fromOwner.name }}
              </div>
              <div class='text-grey-6 page-header-network'>
                0x{{ shortid.shortId(fromOwner.owner, 6) }}
              </div>
            </div>
          </div>
        </template>
      </q-btn-dropdown>
      <q-btn-dropdown
        flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin'
        no-caps dense
        dropdown-icon='none'
        menu-anchor='bottom left'
        menu-self='top left'
      >
        <template #label>
          <div class='row full-width'>
            <q-avatar>
              <q-img v-if='fromMicrochain' :src='db.microchainAvatar(fromMicrochain)' width='36px' height='36px' />
            </q-avatar>
            <div v-if='fromMicrochain' class='header-items-margin-x-left text-left'>
              <div>
                {{ fromMicrochain.name || 'Microchain' }}
              </div>
              <div class='text-grey-6 page-header-network'>
                0x{{ shortid.shortId(fromMicrochain.microchain, 6) }}
              </div>
            </div>
          </div>
        </template>
      </q-btn-dropdown>
      <div class='text-grey-6 vertical-menus-margin'>
        {{ $t('MSG_TO') }} <span class='like-link'>{{ toChainBalance ? 'chain balance' : 'account balance' }}</span>
      </div>
      <q-btn-dropdown
        flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin'
        no-caps dense
        dropdown-icon='none'
        menu-anchor='bottom left'
        menu-self='top left'
        v-if='toOwner'
      >
        <template #label>
          <div class='row full-width'>
            <q-avatar>
              <q-img v-if='toOwner' :src='db.ownerAvatar(toOwner)' width='36px' height='36px' />
            </q-avatar>
            <div v-if='toOwner' class='header-items-margin-x-left text-left'>
              <div>
                {{ toOwner.name }}
              </div>
              <div class='text-grey-6 page-header-network'>
                0x{{ shortid.shortId(toOwner.owner, 6) }}
              </div>
            </div>
          </div>
        </template>
      </q-btn-dropdown>
      <div v-else class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin transfer-tip text-grey-6 cursor-pointer word-break-all'>
        {{ toAddress }}
      </div>
      <q-btn-dropdown
        flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin'
        no-caps dense
        dropdown-icon='none'
        menu-anchor='bottom left'
        menu-self='top left'
        v-if='toMicrochain'
      >
        <template #label>
          <div class='row full-width'>
            <q-avatar>
              <q-img v-if='toMicrochain' :src='db.microchainAvatar(toMicrochain)' width='36px' height='36px' />
            </q-avatar>
            <div v-if='toMicrochain' class='header-items-margin-x-left text-left'>
              <div>
                {{ toMicrochain.name || 'Microchain' }}
              </div>
              <div class='text-grey-6 page-header-network'>
                0x{{ shortid.shortId(toMicrochain.microchain, 6) }}
              </div>
            </div>
          </div>
        </template>
      </q-btn-dropdown>
      <div v-else class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin transfer-tip text-grey-6 cursor-pointer word-break-all'>
        {{ toMicrochainId }}
      </div>
    </div>
    <div class='row info info-bg tip'>
      <q-icon name='bi-info-circle-fill' size='20px' color='green-6' />
      <div :style='{width: "calc(100% - 26px)", fontSize: "13px"}' class='page-item-x-margin-left text-grey-8'>
        {{ $t('MSG_SMALL_AMOUNT_NATIVE_TOKEN_FOR_GAS') }}
      </div>
    </div>
    <div class='page-y-padding'>
      <q-btn
        flat
        rounded
        :label='$t("MSG_CONTINUE")'
        class='btn full-width extra-margin-bottom'
        @click='onTransferClick'
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { dbBridge } from 'src/bridge'

interface Props {
  token: db.Token
  fromOwner: db.Owner
  fromMicrochain: db.Microchain
  toOwner?: db.Owner
  toMicrochain?: db.Microchain
  toAddress?: string
  toMicrochainId?: string
  fromChainBalance: boolean
  toChainBalance: boolean
  amount: number
}
const props = defineProps<Props>()
const token = toRef(props, 'token')
const fromOwner = toRef(props, 'fromOwner')
const fromMicrochain = toRef(props, 'fromMicrochain')
const toOwner = toRef(props, 'toOwner')
const toMicrochain = toRef(props, 'toMicrochain')
const toAddress = toRef(props, 'toAddress')
const toMicrochainId = toRef(props, 'toMicrochainId')
const fromChainBalance = toRef(props, 'fromChainBalance')
const toChainBalance = toRef(props, 'toChainBalance')
const amount = toRef(props, 'amount')

const tokenLogo = ref('')

const emit = defineEmits<{(ev: 'confirmed'): void}>()

const onTransferClick = () => {
  emit('confirmed')
}

onMounted(async () => {
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

</script>
