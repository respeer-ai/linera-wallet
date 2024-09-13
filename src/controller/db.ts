import Dexie, { type EntityTable } from 'dexie'
import { db as dbModel } from '../model'

export const dbBase = new Dexie('CheCkoBaseDatabase') as Dexie & {
  networks: EntityTable<dbModel.Network, 'id'>,
  passwords: EntityTable<dbModel.Password, 'id'>,
  tokens: EntityTable<dbModel.Token, 'id'>
}

dbBase.version(1).stores({
  networks: '++id, icon, name, faucetUrl, rpcSchema, wsSchema, host, port, path, selected, preset',
  passwords: '++id, password, salt, createdAt',
  tokens: '++id, name, ticker, tokenType, icon, applicationId, native, usdCurrency'
})

export const dbWallet = new Dexie('CheCkoWalletDatabase') as Dexie & {
  microchainOwners: EntityTable<dbModel.MicrochainOwner, 'id'>,
  microchains: EntityTable<dbModel.Microchain, 'id'>,
  owners: EntityTable<dbModel.Owner, 'id'>,
  microchainFungibleTokenBalances: EntityTable<dbModel.MicrochainFungibleTokenBalance, 'id'>,
  microchainOwnerFungibleTokenBalances: EntityTable<dbModel.MicrochainOwnerFungibleTokenBalance, 'id'>,
  nfts: EntityTable<dbModel.NFT, 'id'>
}

dbWallet.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains: '++id, microchain, balance, messageId, certificateHash, networkId, name, default, selected',
  owners: '++id, address, owner, privateKey, salt, name, selected',
  microchainFungibleTokenBalances: '++id, microchain, tokenId, balance',
  microchainOwnerFungibleTokenBalances: '++id, microchain, owner, tokenId, balance',
  nfts: '++id, collectionId, tokenId, uri, microchain, owner'
})
