import Dexie, { type EntityTable } from 'dexie'
import { dbModel } from '../model'

export const dbBase = new Dexie('CheCkoBaseDatabase') as Dexie & {
  networks: EntityTable<dbModel.Network, 'id'>
  passwords: EntityTable<dbModel.Password, 'id'>
  tokens: EntityTable<dbModel.Token, 'id'>
  lastLogin: EntityTable<dbModel.LoginTimestamp, 'id'>
  rpcAuths: EntityTable<dbModel.RpcAuth, 'id'>
  rpcMicrochains: EntityTable<dbModel.OriginRpcMicrochain, 'id'>
  deviceFingerPrint: EntityTable<dbModel.DeviceFingerPrint, 'id'>
}

dbBase.version(1).stores({
  networks: '++id, icon, name, faucetUrl, rpcUrl, rpcWsUrl, selected, preset',
  passwords: '++id, password, salt, createdAt',
  tokens:
    '++id, name, ticker, tokenType, description, applicationId, creatorChainId, native, usdCurrency, discord, telegram, twitter, website, github, totalSupply',
  lastLogin: '++id, timestamp',
  rpcAuths:
    '++id, origin, publicKey, chainId, method, applicationId, operation, expiredAt',
  rpcMicrochains: '++id, origin, publicKey, microchain',
  deviceFingerPrint: '++id, fingerPrint'
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
  chainOperations: EntityTable<dbModel.ChainOperation, 'id'>
  operationBlobs: EntityTable<dbModel.OperationBlob, 'id'>
}

dbWallet.version(1).stores({
  microchainOwners: '++id, microchain, owner, balance',
  microchains:
    '++id, microchain, messageId, certificateHash, name, default, imported, state, openChainCertificateHash',
  owners: '++id, address, owner, privateKey, salt, name, selected',
  microchainFungibleTokenBalances:
    '++id, &[microchain+tokenId], microchain, balance',
  microchainOwnerFungibleTokenBalances:
    '++id, &[microchain+owner+tokenId], microchain, owner, balance',
  nfts: '++id, collectionId, tokenId, uri, microchain, owner',
  applications:
    '++id, applicationId, creationMicrochain, creationHeight, applicationIndex',
  activities:
    '++id, sourceChain, sourceAddress, targetChain, targetAddress, amount, blockHeight, timestamp, certificateHash, grant, tokenId, microchain',
  chainOperations:
    '++id, operationType, applicationType, operationId, microchain, operation, state, certificateHash, createdAt, errorAt, lastErrorAt, failedAt, failReason, graphqlQuery, graphqlVariables',
  operationBlobs: '++id, operationId, blob'
})
