import localforage from 'localforage'

const store = localforage.createInstance({
  name: 'checko-wallet'
})

export const getAccounts = async () => {
  const accounts = await store.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string)
  if (!_accounts) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}

export const getCurrentPopupId = async () => {
  const popupId = await store.getItem('current_popup_id')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _popupId = JSON.parse(popupId as string)
  if (_popupId === undefined) return -1
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Number(_popupId)
}
