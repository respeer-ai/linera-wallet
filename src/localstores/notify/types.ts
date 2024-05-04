import { NotifyType } from './const'

export interface Notification {
  Title?: string
  Message?: string
  Description?: string
  Popup?: boolean
  Type?: NotifyType
}
