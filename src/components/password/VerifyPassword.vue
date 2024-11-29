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
        :label='$t("MSG_VERIFY")'
        @click='onVerifyClick'
        :disable='passwordError'
        no-caps
      />
      <q-btn
        flat
        class='btn btn-alt full-width vertical-items-margin'
        :label='$t("MSG_CANCEL")'
        @click='onCancelClick'
        no-caps
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </q-card>
  <PasswordBridge ref='passwordBridge' />
</template>

<script setup lang='ts'>
import { onMounted, ref, toRef, watch } from 'vue'
import { localStore } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import InputPassword from '../password/InputPassword.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import { dbBridge } from 'src/bridge'

const { t } = useI18n({ useScope: 'global' })

interface Props {
  title?: string
  showTitle?: boolean
  checkLoginTimeout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showTitle: true,
  checkLoginTimeout: false
})
const title = toRef(props, 'title')
const showTitle = toRef(props, 'showTitle')
const checkLoginTimeout = toRef(props, 'checkLoginTimeout')

const password = defineModel<string>('password', { default: '' })
const shadowPassword = ref('')
const emit = defineEmits(['verified', 'error', 'cancel'])

const passwordError = ref(false)

const passwordBridge = ref<InstanceType<typeof PasswordBridge>>()

watch(shadowPassword, () => {
  password.value = shadowPassword.value
})

const onVerifyClick = async () => {
  if (await dbBridge.Password.verify(password.value)) {
    await dbBridge.LoginTimestamp.save()
    emit('verified')
  } else {
    emit('error')
    localStore.notification.pushNotification({
      Title: t('MSG_VERIFY_PASSWORD'),
      Message: t('MSG_FAILED_VERIFY_PASSWORD'),
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

onMounted(async () => {
  if (checkLoginTimeout.value) {
    if (!await dbBridge.LoginTimestamp.loginTimeout()) {
      password.value = await dbBridge.Password.password() as string
      emit('verified')
    }
  }
})

</script>
