<template>
  <div>
    <PupupHeader />
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { onMounted, computed, onUnmounted } from 'vue'
import { persistentsetting } from 'src/localstores'

import PupupHeader from 'src/components/extension/PupupHeader.vue'

const quasar = useQuasar()
const _persistentsetting = persistentsetting.useSettingStore()
const nextPopupId = computed(() => _persistentsetting.nextPopupId)

const saveCurrentPopupId = () => {
  _persistentsetting.load(() => {
    _persistentsetting.setCurrentPopupId(nextPopupId.value)
  })
}

onMounted(() => {
  quasar.bex.on('popup.new', () => {
    saveCurrentPopupId()
  })
  saveCurrentPopupId()
})

onUnmounted(() => {
  _persistentsetting.setCurrentPopupId(0)
})
</script>
