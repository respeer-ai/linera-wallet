import localforage from 'localforage'

const walletStore = localforage.createInstance({
  name: 'checko-wallet'
})

export const getAccounts = async () => {
  const accounts = await walletStore.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string)
  if (!_accounts) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}
