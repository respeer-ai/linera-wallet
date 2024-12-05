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

export const getMicrochain = async (microchain: string) => {
  return await dbWallet.microchains
    .where('microchain')
    .equals(microchain)
    .first()
}

export const updateMicrochain = async (microchain: db.Microchain) => {
  return await dbWallet.microchains.update(microchain.id, microchain)
}

export const getMicrochains = async (owner?: string) => {
  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter(
    (el) => !owner || el.owner === owner
  )
  return (await dbWallet.microchains.toArray())
    .filter(
      (el1) =>
        microchainOwners.findIndex((el) => el.microchain === el1.microchain) >=
        0
    )
    .map((el) => el.microchain)
}

export const microchainOwner = async (microchain: string) => {
  const microchainOwners = await dbWallet.microchainOwners
    .where('microchain')
    .equals(microchain)
    .toArray()
  const owners = microchainOwners.map((el) => el.owner)
  return await dbWallet.owners.where('owner').anyOf(owners).first()
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
  return (
    (await dbBase.rpcAuths.toArray()).findIndex(
      (el) =>
        el.origin === origin &&
        el.method === method &&
        (applicationId === undefined || el.applicationId === applicationId) &&
        (operation === undefined || el.operation === operation) &&
        el.expiredAt > Date.now()
    ) >= 0
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
  return (
    network.wsSchema +
    '://' +
    network.host +
    ':' +
    network.port.toString() +
    '/ws'
  )
}

export const createChainOperation = async (operation: db.ChainOperation) => {
  operation.state = db.OperationState.CREATED
  operation.createdAt = Date.now()
  await dbWallet.chainOperations.add(operation)
}

export const getChainOperations = async (
  microchain: string | undefined,
  certificateHash: string | undefined,
  states: db.OperationState[],
  stateHash?: string
) => {
  let query = dbWallet.chainOperations.where('state').anyOf(states)
  if (microchain) {
    query = query.and((op) => op.microchain === microchain)
  }
  if (certificateHash) {
    query = query.and((op) => op.certificateHash === certificateHash)
  }
  if (stateHash) {
    query = query.and((op) => op.stateHash === stateHash)
  }
  return await query.toArray()
}

export const updateChainOperation = async (operation: db.ChainOperation) => {
  await dbWallet.chainOperations.update(operation.id, operation)
}

export const nativeToken = async () => {
  return (await dbBase.tokens.toArray()).find((el) => el.native)
}

export const token = async (applicationId: string) => {
  return (await dbBase.tokens.toArray()).find(
    (el) => el.applicationId === applicationId
  )
}

export const createActivity = async (
  microchain: string,
  tokenId: number,
  sourceChain: string,
  sourceAddress: string | undefined,
  targetChain: string,
  targetAddress: string | undefined,
  amount: string,
  blockHeight: number,
  timestamp: number,
  certificateHash: string,
  grant: string
): Promise<db.Activity> => {
  const exist = (await dbWallet.activities.toArray()).find((el) => {
    return (
      el.sourceChain === sourceChain &&
      el.sourceAddress === sourceAddress &&
      el.targetChain === targetChain &&
      el.targetAddress === targetAddress &&
      el.timestamp === timestamp &&
      el.blockHeight === blockHeight &&
      el.certificateHash === certificateHash
    )
  })
  if (exist) return exist
  const activity = {
    microchain,
    tokenId,
    sourceChain,
    sourceAddress,
    targetChain,
    targetAddress,
    amount,
    blockHeight,
    timestamp,
    certificateHash,
    grant
  } as db.Activity
  await dbWallet.activities.add(activity)
  return activity
}
