import { useAuthStore } from './auth'
import { useNotificationStore, notify, NotifyType } from './notify'
import { usePopupStore } from './popup'
import { useSettingStore as useOneShotSettingStore } from './setting/oneshot'
import { useSettingStore as usePersistentSettingStore } from './setting/persistent'
import { useWalletStore } from './wallet'

const wallet = useWalletStore()
const notification = useNotificationStore()
const persistentSetting = usePersistentSettingStore()
const oneShotSetting = useOneShotSettingStore()
const popup = usePopupStore()
const auth = useAuthStore()

export const localStore = {
  wallet,
  notification,
  notify,
  NotifyType,
  persistentSetting,
  oneShotSetting,
  popup,
  auth
}
