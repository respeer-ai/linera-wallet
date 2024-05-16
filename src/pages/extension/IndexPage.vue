<template>
  <q-card flat class='main-account-block'>
    <q-card-section>
      <div class='left'>
        $ 0
      </div>
    </q-card-section>
  </q-card>
  <div class='menu-container row justify-between'>
    <q-item-section
      avatar v-for='menu in menus' :key='menu.icon' class='items-center hot-menu'
      @click='onMenuClick(menu)'
    >
      <q-icon :name='menu.icon' size='30px' />
      <span class='menu-label'>{{ menu.label }}</span>
    </q-item-section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { wallet, notify } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import { useRouter } from 'vue-router'

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

onMounted(() => {
  _wallet.load()
  notification.$subscribe((_, state) => {
    state.Notifications.forEach((notif, index) => {
      if (notif.Popup) {
        state.Notifications.splice(index, 1)
        if (notif.Description) {
          notif.Description = t(notif.Description)
        }
        if (notif.Message) {
          notif.Message = t(notif.Message)
        }
        if (notif.Title) {
          notif.Title = t(notif.Title)
        }
        notify.notify(notif)
      }
    })
  })
})

interface MenuItem {
  icon: string
  label: string
  target: string
}

const menus = ref([
  {
    icon: 'account_balance_wallet',
    label: 'Transfer',
    target: '/transfer'
  },
  {
    icon: 'account_tree',
    label: 'Accounts',
    target: '/accounts'
  },
  {
    icon: 'link',
    label: 'Microchains',
    target: '/microchains'
  },
  /* {
    icon: 'monetization_on',
    label: 'Assets'
  },
  {
    icon: 'contacts',
    label: 'Contacts'
  },
  {
    icon: 'security',
    label: 'Security'
  },
  {
    icon: 'token',
    label: 'NFT'
  },
  {
    icon: 'apps',
    label: 'Application Portal'
  }, */
  {
    icon: 'settings',
    label: 'Setting',
    target: '/setting'
  }
] as Array<MenuItem>)

const router = useRouter()
const onMenuClick = (menu: MenuItem) => {
  void router.push('/extension' + menu.target)
}
</script>

<style scoped lang="sass">
.hot-menu
  &:hover
    cursor: pointer
.main-account-block
  margin-bottom: 15px
  border-radius: 10px
  .left
    text-align: center
    font-size: 45px
::v-deep .q-card__section--vert
  padding: 0
</style>
