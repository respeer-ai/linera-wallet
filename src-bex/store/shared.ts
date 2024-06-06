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

export const getPopupIDs = async () => {
  const popupIDs = await store.getItem('popup_ids')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _popupIDs = JSON.parse(popupIDs as string)
  if (!_popupIDs) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(_popupIDs)
}
