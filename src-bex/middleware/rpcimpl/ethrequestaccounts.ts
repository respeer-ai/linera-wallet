import localforage from 'localforage'

const getAccounts = async () => {
  const store = localforage.createInstance({
    name: 'checko-wallet'
  })
  const accounts = await store.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}

export const ethRequestAccountsHandler = async () => {
  return {
    res: Array.from(await getAccounts())
  }
}
