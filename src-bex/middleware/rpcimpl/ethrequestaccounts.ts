import { sharedStore } from '../../store'

export const ethRequestAccountsHandler = async () => {
  return {
    res: Array.from(await sharedStore.getAccounts())
  }
}
