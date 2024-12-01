import { copyToClipboard } from 'quasar'
import { localStore } from 'src/localstores'

export const _copyToClipboard = (
  content: string,
  evt: {
    preventDefault(): unknown
    clipboardData: { getData: (arg0: string) => string }
  }
) => {
  evt.preventDefault()
  copyToClipboard(content)
    .then(() => {
      localStore.notification.pushNotification({
        Title: 'Copy content',
        Message: `Success copy ${content.substring(0, 20)}... to clipboard.`,
        Popup: true,
        Type: localStore.notify.NotifyType.Info
      })
    })
    .catch((e) => {
      localStore.notification.pushNotification({
        Title: 'Copy content',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Message: `Failed copy ${content.substring(0, 20)}...: ${e}`,
        Popup: true,
        Type: localStore.notify.NotifyType.Error
      })
    })
}
