import localforage from 'localforage'
import { OriginRpcAuth, RpcMethod } from '../middleware/types'

const walletStore = localforage.createInstance({
  name: 'checko-wallet'
})
const permissionStore = localforage.createInstance({
  name: 'application-authenticates'
})

export const getAccounts = async () => {
  const accounts = await walletStore.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string) || []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}

export const authenticated = async (origin: string, method: RpcMethod) => {
  const authenticates = await permissionStore.getItem('authenticates')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _authenticates = JSON.parse(authenticates as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const auth = _authenticates[origin] as OriginRpcAuth
  if (!auth || !auth.methods) return false
  return auth.methods.includes(method)
}
