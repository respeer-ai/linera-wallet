import Dexie, { type EntityTable } from 'dexie'
import { Microchain, MicrochainOwner, Network, Owner } from '../model'

export const dbNetwork = new Dexie('LineraNetworkDatabase') as Dexie & {
  networks: EntityTable<Network, 'id'>
}

dbNetwork.version(1).stores({
  networks: '++id, icon, name, faucetUrl, rpcSchema, wsSchema, host, port, path'
})

export const dbWallet = (networkId: number) => {
  const db = new Dexie(`CheCkoWalletDatabaseNetwork${networkId}`) as Dexie & {
    microchainOwners: EntityTable<MicrochainOwner, 'id'>,
    microchains: EntityTable<Microchain, 'microchain'>,
    owners: EntityTable<Owner, 'address'>
  }
  db.version(1).stores({
    microchainOwners: '++id, microchain, owner, balance',
    microchains: '++id, microchain, balance, messageId, certificateHash, faucetUrl',
    owners: '++id, address, owner, privateKey, salt'
  })
  return db
}
