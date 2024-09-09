import Dexie, { type EntityTable } from 'dexie'
import { Microchain, MicrochainOwner, Owner } from '../model'

export const db = new Dexie('CheCkoWalletDatabase') as Dexie & {
  microchainOwners: EntityTable<MicrochainOwner, 'id'>,
  microchains: EntityTable<Microchain, 'microchain'>,
  owners: EntityTable<Owner, 'address'>
}

db.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains: '++id, microchain, balance, messageId, certificateHash, faucetUrl',
  owners: '++id, address, owner, privateKey, salt'
})
