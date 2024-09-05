<template>
  <div class='row header-inner-padding'>
    <q-img
      src='~assets/CheCko.png'
      height='24px'
      width='160px'
      fit='contain'
      class='cursor-pointer'
    />

    <q-space />
    <q-btn-dropdown
      dense
      rounded
      flat
      class='text-brown-10 header-dropdown'
      push
      no-caps
      outline
      auto-close
      :style='{width: "128px"}'
      dropdown-icon='bi-chevron-down'
    >
      <q-list>
        <q-item
          v-for='opt in langOptions' :key='opt.value' clickable v-close-popup
          dense
          @click='onLangClick(opt)'
          :class='[ label === opt.label ? "header-selected-lang" : "", "header-text" ]'
        >
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <template #label>
        <div class='row full-width'>
          <q-icon name='bi-globe' size='16px' :style='{margin: "4px 6px"}' />
          <div class='header-text'>
            <div :style='{paddingTop: "1px"}'>
              {{ label }}
            </div>
          </div>
        </div>
      </template>
    </q-btn-dropdown>
  </div>
</template>

<script setup lang='ts'>
import { LangOption, langOptions } from 'src/i18n'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n({ useScope: 'global' })
const label = ref(langOptions.find((el) => el.value === locale.value)?.label)

const onLangClick = (opt: LangOption) => {
  locale.value = opt.value
}

</script>
<style scoped lang="sass">
</style>
