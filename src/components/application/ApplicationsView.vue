<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
      <div v-if='applications.length > 0'>
        <ApplicationCardView v-for='application in applications' :key='application.applicationId' :application='application' />
      </div>
      <div v-else class='page-item-placeholder'>
        <div class='cursor-pointer'>
          <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
        </div>
        <div class='page-item-y-margin-top' v-html='$t("MSG_NO_APPLICATIONS_CREATE_NEW")' />
      </div>
    </div>
    <q-space />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { dbModel } from 'src/model'

import ApplicationCardView from './ApplicationCardView.vue'

const applications = ref([] as dbModel.Application[])

// TODO: get applications from ams

</script>
