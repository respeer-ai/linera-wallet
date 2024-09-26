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
  const _accounts = JSON.parse(accounts as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Array.from(Object.keys(_accounts))
}

export const getAccountWithPrefix = async (prefix: string) => {
  const accounts = await walletStore.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const account of Object.keys(_accounts)) {
    if (account.startsWith(prefix.slice(2))) {
      return account
    }
  }
  return undefined
}

export const getMicrochains = async (account?: string) => {
  const accounts = await walletStore.getItem('accounts')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _accounts = JSON.parse(accounts as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const microchains = [] as string[]
  if (account) {
    const _account = (_accounts as Record<string, unknown>)[account]
    microchains.push(...Object.keys(((_account as Record<string, unknown>).microchains as Record<string, unknown>)))
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Object.values(_accounts).forEach((_account) => {
      microchains.push(...Object.keys(((_account as Record<string, unknown>).microchains as Record<string, unknown>)))
    })
  }
  return microchains
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authenticated = (origin: string, method: RpcMethod) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  // TODO: get from dexie database
  return false
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

export const getSubscriptionEndpoint = async () => {
  const setting = await settingStore.getItem('setting')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _setting = JSON.parse(setting as string) || {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!_setting.rpcHost || !_setting.rpcWSSchema || !_setting.rpcPort) return Promise.reject(new Error('Invalid subscription endpoint'))
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access
  return _setting.rpcWSSchema + '://' + _setting.rpcHost + ':' + _setting.rpcPort + '/ws'
}
