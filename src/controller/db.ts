import Dexie, { type EntityTable } from 'dexie'
import { db as dbModel } from '../model'

export const dbBase = new Dexie('CheCkoBaseDatabase') as Dexie & {
  networks: EntityTable<dbModel.Network, 'id'>,
  passwords: EntityTable<dbModel.Password, 'id'>
}

dbBase.version(1).stores({
  networks: '++id, icon, name, faucetUrl, rpcSchema, wsSchema, host, port, path, selected, preset',
  passwords: '++id, password, salt, createdAt'
})

export const dbWallet = new Dexie('CheCkoWalletDatabase') as Dexie & {
  microchainOwners: EntityTable<dbModel.MicrochainOwner, 'id'>,
  microchains: EntityTable<dbModel.Microchain, 'id'>,
  owners: EntityTable<dbModel.Owner, 'id'>
}

dbWallet.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains: '++id, microchain, balance, messageId, certificateHash, networkId, name, default, selected',
  owners: '++id, address, owner, privateKey, salt, name, selected'
})
