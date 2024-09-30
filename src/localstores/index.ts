import { useNotificationStore } from './notify'
import { usePopupStore } from './popup'
import { useSettingStore } from './setting'
import { useOperationStore } from './operation'

import * as notify from './notify'
import * as settingDef from './setting'

export const notification = useNotificationStore()
export const setting = useSettingStore()
export const popup = usePopupStore()
export const operation = useOperationStore()

export const localStore = {
  notification,
  notify,
  setting,
  settingDef,
  popup,
  operation
}

export * as notify from './notify'
export * as settingDef from './setting'
export * as operationDef from './operation'
