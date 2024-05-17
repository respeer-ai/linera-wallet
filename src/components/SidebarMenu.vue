<template>
  <div v-if='currentAddress'>
    <q-drawer
      v-model='minimal'
      show-if-above
      :width='220'
      :breakpoint='800'
    >
      <q-scroll-area :style='{height: "100%"}'>
        <q-list padding class='menu-list'>
          <q-item
            v-for='menu in menus'
            :key='menu.label'
            :clickable='!menu.disable'
            v-ripple
            @click='onMenuClick(menu)'
            :class='[ selectedMenu === menu.label ? "text-red-8 bg-red-1" : "" ]'
            :disable='menu.disable'
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
    </q-drawer>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const currentAddress = computed(() => _wallet.currentAddress)

const minimal = ref(false)
const selectedMenu = ref('Microchains')

const route = useRoute()
const path = computed(() => route.path)

interface MenuItem {
  icon: string
  label: string
  target: string
  disable: boolean
}

const menus = ref([
  {
    icon: 'account_balance_wallet',
    label: 'Transfer',
    target: '/transfer',
    disable: false
  }, {
    icon: 'account_tree',
    label: 'Accounts',
    target: '/accounts',
    disable: false
  }, {
    icon: 'link',
    label: 'Microchains',
    target: '/microchains',
    disable: false
  }, {
    icon: 'library_books',
    label: 'Activity',
    target: '/activity',
    disable: false
  }, {
    icon: 'contacts',
    label: 'Contacts',
    disable: true
  }, {
    icon: 'security',
    label: 'Security',
    disable: true
  }, {
    icon: 'settings',
    label: 'Setting',
    target: '/setting',
    disable: false
  }
] as Array<MenuItem>)

const router = useRouter()
const onMenuClick = (menu: MenuItem) => {
  selectedMenu.value = menu.label
  void router.push(menu.target)
}

const updateSidebarMenu = () => {
  for (let i = 0; i < menus.value.length; i++) {
    if (menus.value[i].target === path.value) {
      selectedMenu.value = menus.value[i].label
      break
    }
  }
}

onMounted(() => {
  updateSidebarMenu()
})

watch(path, () => {
  updateSidebarMenu()
})

</script>

<style scoped lang='sass'>
.q-item
  .q-item__section--avatar
    padding-right: 0
    min-width: 32px
</style>
