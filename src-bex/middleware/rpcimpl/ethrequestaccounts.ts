import { sharedStore } from '../../store'

export const ethRequestAccountsHandler = async () => {
  return Array.from(await sharedStore.getAccounts())
}
