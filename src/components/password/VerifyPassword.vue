<template>
  <q-card flat class='text-center fill-parent'>
    <h5 class='vertical-items-margin text-bold' v-if='showTitle'>
      {{ title }}
    </h5>
    <div
      :class='[ showTitle ? "vertical-sections-margin" : "flex items-center justify-center" ]'
      :style='{ height: "calc(100% - " + (showTitle ? "80px - " : "") + actionHeight + "px" + ")" }'
    >
      <InputPassword v-model:password='shadowPassword' v-model:error='passwordError' />
    </div>
    <div>
      <q-btn
        flat
        class='btn full-width vertical-sections-margin'
        label='Verify'
        @click='onVerifyClick'
        :disable='passwordError'
        no-caps
      />
      <q-btn
        flat
        class='btn btn-alt full-width vertical-items-margin'
        label='Cancel'
        @click='onCancelClick'
        no-caps
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </q-card>
  <PasswordBridge ref='passwordBridge' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { localStore } from 'src/localstores'

import InputPassword from '../password/InputPassword.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

interface Props {
  title?: string
  showTitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showTitle: true
})
const title = toRef(props, 'title')
const showTitle = toRef(props, 'showTitle')

const password = defineModel<string>('password', { default: '' })
const shadowPassword = ref('')
const emit = defineEmits(['verified', 'error', 'cancel'])

const passwordError = ref(false)

const passwordBridge = ref<InstanceType<typeof PasswordBridge>>()

watch(shadowPassword, () => {
  password.value = shadowPassword.value
})

const onVerifyClick = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  if (await passwordBridge.value?.verifyPassword(password.value)) {
    emit('verified')
  } else {
    emit('error')
    localStore.notification.pushNotification({
      Title: 'Verify assword',
      Message: 'Fail to verify password',
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  }
}

const onCancelClick = () => {
  emit('cancel')
}

interface Size {
  width: number
  height: number
}

const actionHeight = ref(0)

const onActionResize = (size: Size) => {
  actionHeight.value = size.height
}

</script>
