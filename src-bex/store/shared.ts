import { RpcMethod } from '../middleware/types'
import { dbBase, dbWallet } from '../../src/controller'
import { db } from 'src/model'

export const getAccounts = async () => {
  return (await dbWallet.owners.toArray()).map((el) => el.address)
}

export const getAccountWithPrefix = async (prefix: string) => {
  return (await dbWallet.owners.toArray()).find((el) =>
    el.address.startsWith(prefix.slice(prefix.startsWith('0x') ? 2 : 0))
  )?.address
}

export const getMicrochains = async (owner?: string) => {
  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter(
    (el) => el.owner === owner
  )
  return (await dbWallet.microchains.toArray())
    .filter(
      (el1) =>
        microchainOwners.findIndex((el) => el.microchain === el1.microchain) >=
        0
    )
    .map((el) => el.microchain)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authenticated = async (
  origin: string,
  method: RpcMethod,
  applicationId?: string,
  operation?: string
) => {
  if (method === RpcMethod.LINERA_GRAPHQL_MUTATION && !operation)
    return Promise.reject('Invalid operation')
  return (await dbBase.rpcAuths.toArray()).find(
    (el) =>
      el.origin === origin &&
      el.method === method &&
      (applicationId === undefined || el.applicationId === applicationId) &&
      (operation === undefined || el.operation === operation) &&
      el.expiredAt > Date.now()
  )
}

export const getRpcMicrochain = async (
  origin: string,
  publicKey: string
): Promise<string | undefined> => {
  return (await dbBase.rpcMicrochains.toArray()).find(
    (el) => el.origin === origin && el.publicKey === publicKey
  )?.microchain
}

export const getRpcMicrochains = async (origin: string): Promise<string[]> => {
  return (await dbBase.rpcMicrochains.toArray())
    .filter((el) => el.origin === origin)
    .map((el) => el.microchain)
}

export const getOriginPublicKeys = async (
  origin: string
): Promise<string[]> => {
  return (await dbBase.rpcMicrochains.toArray())
    .filter((el) => el.origin === origin)
    .map((el) => el.publicKey)
    .reduce((ids: string[], el): string[] => {
      if (!ids.includes(el)) ids.push(el)
      return ids
    }, [])
}

export const getRpcEndpoint = async () => {
  const network = (await dbBase.networks.toArray()).find(
    (el) => el.selected
  ) as db.Network
  if (!network) return ''
  return (
    network.rpcSchema + '://' + network.host + ':' + network.port.toString()
  )
}

export const getSubscriptionEndpoint = async () => {
  const network = (await dbBase.networks.toArray()).find(
    (el) => el.selected
  ) as db.Network
  if (!network) return ''
  return network.wsSchema + '://' + network.host + ':' + network.port.toString()
}
