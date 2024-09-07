import { useAuthStore } from './auth'
import { useNotificationStore } from './notify'
import { usePopupStore } from './popup'
import { useSettingStore as useOneShotSettingStore } from './setting/oneshot'
import { useSettingStore as usePersistentSettingStore } from './setting/persistent'
import { useWalletStore } from './wallet'

import * as notify from './notify'
import * as walletDef from './wallet'

export const wallet = useWalletStore()
export const notification = useNotificationStore()
export const persistentSetting = usePersistentSettingStore()
export const oneShotSetting = useOneShotSettingStore()
export const popup = usePopupStore()
export const auth = useAuthStore()

export const localStore = {
  wallet,
  walletDef,
  notification,
  notify,
  persistentSetting,
  oneShotSetting,
  popup,
  auth
}

export * as walletDef from './wallet'
export * as notifyDef from './notify'
