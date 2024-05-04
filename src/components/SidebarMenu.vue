<template>
  <div>
    <q-drawer
      v-model='minimal'
      show-if-above
      :width='260'
      :breakpoint='500'
    >
      <q-scroll-area :style='{height: "400px"}'>
        <q-list padding class='menu-list'>
          <q-item
            v-for='menu in menus'
            :key='menu.label'
            clickable
            v-ripple
            @click='onMenuClick(menu)'
            :class='[ selectedMenu === menu.label ? "text-red-8 bg-red-1" : "" ]'
          >
            <q-item-section avatar>
              <q-icon :name='menu.icon' />
            </q-item-section>
            <q-item-section>
              {{ menu.label }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      <div :style='{margin: "16px"}'>
        <div :style='{margin: "6px 0 0 0"}'>
          <OpenChain />
        </div>
        <div :style='{margin: "16px 0"}'>
          <CreateAccount />
        </div>
        <q-btn
          outline
          rounded
          label='Export Accounts'
          class='text-brown-10'
          :style='{margin: "6px 0 0 0"}'
        />
        <q-btn
          outline
          rounded
          label='Export Account'
          class='text-brown-10'
          :style='{margin: "6px 0 0 0"}'
        />
        <q-btn
          outline
          rounded
          label='Clear Accounts'
          @click='onClearAccountsClick'
          class='text-grey-6 bg-grey-3'
          :style='{margin: "24px 0 0 0"}'
        />
      </div>
    </q-drawer>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wallet } from 'src/localstores'

import CreateAccount from './CreateAccount.vue'
import OpenChain from './OpenChain.vue'

const minimal = ref(false)
const selectedMenu = ref('Transfer')

const route = useRoute()
const path = ref(route.path)

interface MenuItem {
  icon: string
  label: string
  target: string
}

const menus = ref([
  {
    icon: 'account_balance_wallet',
    label: 'Transfer',
    target: '/'
  }, {
    icon: 'account_tree',
    label: 'Accounts',
    target: '/accounts'
  }, {
    icon: 'link',
    label: 'Microchains',
    target: '/microchains'
  }, {
    icon: 'monetization_on',
    label: 'Assets'
  }, {
    icon: 'contacts',
    label: 'Contacts'
  }, {
    icon: 'security',
    label: 'Security'
  }, {
    icon: 'token',
    label: 'NFT'
  }
] as Array<MenuItem>)

const router = useRouter()
const onMenuClick = (menu: MenuItem) => {
  selectedMenu.value = menu.label
  void router.push(menu.target)
}

const _wallet = wallet.useWalletStore()

const onClearAccountsClick = () => {
  _wallet.reset()
}

onMounted(() => {
  for (let i = 0; i < menus.value.length; i++) {
    if (menus.value[i].target === path.value) {
      selectedMenu.value = menus.value[i].label
      break
    }
  }
})

</script>

<style scoped lang='sass'>
.q-item
  .q-item__section--avatar
    padding-right: 0
    min-width: 32px
</style>
