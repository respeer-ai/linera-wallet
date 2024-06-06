import localforage from 'localforage'

const walletStore = localforage.createInstance({
  name: 'checko-wallet'
})
const settingStore = localforage.createInstance({
  name: 'setting'
})

export const getAccounts = async () => {
  const accounts = await walletStore.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string)
  if (!_accounts) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}

export const getCurrentPopupId = async () => {
  const setting = await settingStore.getItem('setting')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _setting = JSON.parse(setting as string) as Record<string, number>
  console.log(_setting, setting)
  if (!_setting) return -1
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Number(_setting.currentPopupId)
}
