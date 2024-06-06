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

onMounted(() => {
  quasar.bex.on('popup.new', () => {
    _persistentsetting.setCurrentPopupId(nextPopupId.value)
  })
})

onUnmounted(() => {
  _persistentsetting.setCurrentPopupId(-1)
})
</script>
