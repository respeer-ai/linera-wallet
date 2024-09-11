import Dexie, { type EntityTable } from 'dexie'
import { Microchain, MicrochainOwner, Network, Owner, Password } from '../model'

export const dbBase = new Dexie('CheCkoBaseDatabase') as Dexie & {
  networks: EntityTable<Network, 'id'>,
  passwords: EntityTable<Password, 'id'>
}

dbBase.version(1).stores({
  networks: '++id, icon, name, faucetUrl, rpcSchema, wsSchema, host, port, path, selected, preset',
  passwords: '++id, password, salt, createdAt'
})

export const dbWallet = new Dexie('CheCkoWalletDatabase') as Dexie & {
  microchainOwners: EntityTable<MicrochainOwner, 'id'>,
  microchains: EntityTable<Microchain, 'id'>,
  owners: EntityTable<Owner, 'id'>
}

dbWallet.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains: '++id, microchain, balance, messageId, certificateHash, faucetUrl, name, default, selected, network',
  owners: '++id, address, owner, privateKey, salt, name, selected'
})
