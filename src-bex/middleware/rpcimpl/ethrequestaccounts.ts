import { dbBridge } from '../../../src/bridge'

export const ethRequestAccountsHandler = async () => {
  return Array.from(await dbBridge.Owner.addresses())
}
