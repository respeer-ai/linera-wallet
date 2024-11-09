import Dexie, { type EntityTable } from 'dexie'
import { db as dbModel } from '../model'

export const dbBase = new Dexie('CheCkoBaseDatabase') as Dexie & {
  networks: EntityTable<dbModel.Network, 'id'>
  passwords: EntityTable<dbModel.Password, 'id'>
  tokens: EntityTable<dbModel.Token, 'id'>
  lastLogin: EntityTable<dbModel.LoginTimestamp, 'id'>
  rpcAuths: EntityTable<dbModel.RpcAuth, 'id'>
  rpcMicrochains: EntityTable<dbModel.OriginRpcMicrochain, 'id'>
}

dbBase.version(1).stores({
  networks:
    '++id, icon, name, faucetUrl, rpcSchema, wsSchema, host, port, path, selected, preset',
  passwords: '++id, password, salt, createdAt',
  tokens:
    '++id, name, ticker, tokenType, description, applicationId, native, usdCurrency, mono, discord, telegram, twitter, website, github, totalSupply, mintable',
  lastLogin: '++id, timestamp',
  rpcAuths: '++id, origin, publicKey, chainId, method',
  rpcMicrochains: '++id, origin, publicKey, microchain'
})

export const dbWallet = new Dexie('CheCkoWalletDatabase') as Dexie & {
  microchainOwners: EntityTable<dbModel.MicrochainOwner, 'id'>
  microchains: EntityTable<dbModel.Microchain, 'id'>
  owners: EntityTable<dbModel.Owner, 'id'>
  microchainFungibleTokenBalances: EntityTable<
    dbModel.MicrochainFungibleTokenBalance,
    'id'
  >
  microchainOwnerFungibleTokenBalances: EntityTable<
    dbModel.MicrochainOwnerFungibleTokenBalance,
    'id'
  >
  nfts: EntityTable<dbModel.NFT, 'id'>
  applications: EntityTable<dbModel.Application, 'id'>
  activities: EntityTable<dbModel.Activity, 'id'>
  namedApplications: EntityTable<dbModel.NamedApplication, 'id'>
  applicationCreatorChainSubscriptions: EntityTable<
    dbModel.ApplicationCreatorChainSubscription,
    'id'
  >
}

dbWallet.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains:
    '++id, microchain, messageId, certificateHash, name, default, imported',
  owners: '++id, address, owner, privateKey, salt, name, selected',
  microchainFungibleTokenBalances: '++id, microchain, tokenId, balance',
  microchainOwnerFungibleTokenBalances:
    '++id, microchain, owner, tokenId, balance',
  nfts: '++id, collectionId, tokenId, uri, microchain, owner',
  applications:
    '++id, applicationId, creationMicrochain, creationHeight, applicationIndex',
  activities:
    '++id, sourceChain, sourceAddress, targetChain, targetAddress, amount, blockHeight, timestamp, certificateHash, grant',
  namedApplications: '++id, applicationType, name, applicationId, creatorChain',
  applicationCreatorChainSubscriptions: '++id, applicationId, microchain'
})
