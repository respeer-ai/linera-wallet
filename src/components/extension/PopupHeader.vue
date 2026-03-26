<template>
  <div class='row items-center full-width no-wrap popup-connection'>
    <q-img
      v-if='showFavicon'
      class='popup-connection__icon'
      :src='connection?.favicon'
      width='40px'
      height='40px'
      fit='cover'
      @error='showFavicon = false'
    />
    <div v-else class='popup-connection__icon popup-connection__icon--fallback'>
      {{ fallbackInitial }}
    </div>
    <div class='popup-connection__meta'>
      <div class='text-bold word-break-all popup-connection__name'>
        {{ connection?.name || 'Unknown application' }}
      </div>
      <div class='word-break-all popup-connection__origin'>
        {{ connection?.origin || 'Unknown origin' }}
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed, ref, watch } from 'vue'

const connection = computed(() => localStore.popup.currentConnection)
const showFavicon = ref(true)
const fallbackInitial = computed(() => {
  const source =
    connection.value?.name?.trim() ||
    connection.value?.origin?.replace(/^https?:\/\//, '') ||
    'C'
  return source[0]?.toUpperCase() || 'C'
})

watch(
  () => connection.value?.favicon,
  () => {
    showFavicon.value = !!connection.value?.favicon
  },
  { immediate: true }
)

</script>

<style scoped lang='sass'>
.popup-connection
  gap: 14px

.popup-connection__icon
  flex: 0 0 auto
  display: flex
  align-items: center
  justify-content: center
  border-radius: 12px
  background: #edf5ff
  border: 1px solid rgba(3, 118, 201, 0.14)
  overflow: hidden

.popup-connection__icon--fallback
  color: #0376c9
  font-size: 15px
  font-weight: 700
  letter-spacing: 0.02em

.popup-connection__meta
  min-width: 0
  flex: 1

.popup-connection__name
  color: #111827
  font-size: 14px
  line-height: 1.3

.popup-connection__origin
  margin-top: 4px
  color: #60758c
  font-size: 12px
  line-height: 1.4
</style>
