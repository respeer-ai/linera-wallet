import { useAuthStore } from './auth'
import { useNotificationStore } from './notify'
import { usePopupStore } from './popup'
import { useSettingStore as useOneShotSettingStore } from './setting/oneshot'
import { useSettingStore as usePersistentSettingStore } from './setting/persistent'

import * as notify from './notify'
import * as oneShotSettingDef from './setting/oneshot'

export const notification = useNotificationStore()
export const persistentSetting = usePersistentSettingStore()
export const oneShotSetting = useOneShotSettingStore()
export const popup = usePopupStore()
export const auth = useAuthStore()

export const localStore = {
  notification,
  notify,
  persistentSetting,
  oneShotSetting,
  oneShotSettingDef,
  popup,
  auth
}

export * as notify from './notify'
export * as oneShotSettingDef from './setting/oneshot'
