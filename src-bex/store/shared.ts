import localforage from 'localforage'
import { RpcMethod } from '../middleware/types'

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
  console.log(444, authenticates)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _authenticates = JSON.parse(authenticates as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const methods = _authenticates[origin] as RpcMethod[]
  if (!methods) return false
  return methods.includes(method)
}
