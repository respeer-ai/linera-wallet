import localforage from 'localforage'
import { OriginRpcAuth, RpcMethod } from '../middleware/types'

const walletStore = localforage.createInstance({
  name: 'checko-wallet'
})
const permissionStore = localforage.createInstance({
  name: 'application-authenticates'
})
const settingStore = localforage.createInstance({
  name: 'setting'
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

export const getRpcAuth = async (origin: string): Promise<OriginRpcAuth | undefined> => {
  const authenticates = await permissionStore.getItem('authenticates')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _authenticates = JSON.parse(authenticates as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  return Promise.resolve(_authenticates[origin] as OriginRpcAuth)
}

export const getRpcEndpoint = async () => {
  const setting = await settingStore.getItem('setting')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _setting = JSON.parse(setting as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!_setting.rpcHost || !_setting.rpcSchema || !_setting.rpcPort) return Promise.reject(new Error('Invalid rpc endpoint'))
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access
  return _setting.rpcSchema + '://' + _setting.rpcHost + ':' + _setting.rpcPort
}
