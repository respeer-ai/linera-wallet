<template>
  <div class='sidebar'>
    <div class='setting-header text-grey-9 text-bold'>
      Settings
    </div>
    <q-list padding class='menu-list'>
      <q-item
        v-for='menu in localStore.oneShotSettingDef.SettingMenus'
        :key='menu.label'
        :clickable='!menu.disable'
        v-ripple
        @click='onMenuClick(menu)'
        :class='[ selectedMenu === menu.label ? "bg-red-1" : "" ]'
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
  </div>
</template>

<script setup lang='ts'>
import { localStore, oneShotSettingDef } from 'src/localstores'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const selectedMenu = ref(localStore.oneShotSettingDef.Menu.NETWORKS)

const route = useRoute()
const path = computed(() => route.path)

const router = useRouter()
const onMenuClick = (menu: oneShotSettingDef.MenuItem) => {
  selectedMenu.value = menu.label
  void router.push(menu.target)
}

const updateSidebarMenu = () => {
  for (let i = 0; i < localStore.oneShotSettingDef.SettingMenus.length; i++) {
    if (localStore.oneShotSettingDef.SettingMenus[i].target === path.value) {
      selectedMenu.value = localStore.oneShotSettingDef.SettingMenus[i].label
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
