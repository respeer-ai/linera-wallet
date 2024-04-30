<template>
  <div>
    <q-drawer
      v-model='minimal'
      show-if-above
      :width='160'
      :breakpoint='500'
    >
      <q-scroll-area class='fit'>
        <q-list padding class='menu-list'>
          <q-item
            v-for='menu in menus'
            :key='menu.label'
            clickable
            v-ripple
            @click='onMenuClick(menu)'
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const minimal = ref(false)

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
  void router.push(menu.target)
}

</script>

<style scoped lang='sass'>
.q-item
  .q-item__section--avatar
    padding-right: 0
    min-width: 32px
</style>
