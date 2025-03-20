import { dbBase } from 'src/controller'
import { db } from 'src/model'
import { Network } from './network'
import { NamedApplication } from './named_application'
import { ApplicationCreatorChain } from '../rpc'
import { Microchain } from './microchain'

export class Token {
  static initialize = async (nativeLogo: string) => {
    if (await Token.native()) return
    db.lineraToken.logo = nativeLogo
    await dbBase.tokens.add(db.lineraToken)
  }

  static create = async (token: db.Token) => {
    if (
      (await dbBase.tokens.toArray()).findIndex(
        (el) => el.applicationId === token.applicationId
      ) >= 0
    )
      return
    await dbBase.tokens.add(token)
  }

  static update = async (token: db.Token) => {
    await dbBase.tokens.update(token.id, token)
  }

  static delete = async (id: number) => {
    await dbBase.tokens.delete(id)
  }

  static native = async () => {
    return (await dbBase.tokens.toArray()).find((el) => el.native)
  }

  static fungibles = async () => {
    return (await dbBase.tokens.toArray()).filter(
      (el) => el.tokenType === db.TokenType.Fungible
    )
  }

  static token = async (applicationId: string) => {
    return (await dbBase.tokens.toArray()).find(
      (el) => el.applicationId === applicationId
    )
  }

  static tokens = async (
    offset: number,
    limit: number,
    applicationIds?: string[]
  ): Promise<db.Token[]> => {
    if (applicationIds && applicationIds.length) {
      return await dbBase.tokens
        .where('applicationId')
        .anyOf(applicationIds)
        .offset(offset)
        .limit(limit)
        .toArray()
    }
    return await dbBase.tokens.offset(offset).limit(limit).toArray()
  }

  static count = async () => {
    return await dbBase.tokens.count()
  }

  static tokenWithId = async (id: number) => {
    return (await dbBase.tokens.toArray()).find((el) => el.id === id)
  }

  static exists = async (applicationId: string) => {
    return (
      (await dbBase.tokens
        .where('applicationId')
        .equals(applicationId)
        .first()) !== undefined
    )
  }

  static logo = async (tokenId: number) => {
    const token = await dbBase.tokens.get(tokenId)
    if (!token) return undefined
    if (token.native) return token.logo
    const network = await Network.selected()
    if (!network) return token.logo
    const namedApplication = await NamedApplication.namedApplicationWithType(
      db.ApplicationType.BLOB_GATEWAY
    )
    if (!namedApplication) return token.logo
    const microchain = await Microchain.anyMicrochain()
    if (!microchain) return token.logo
    const creationChain = await ApplicationCreatorChain.id(
      microchain.microchain,
      namedApplication.applicationId
    )
    const blobGatewayUrl = network.blobGatewayUrl.endsWith('/')
      ? network.blobGatewayUrl.slice(0, network.blobGatewayUrl.length - 1)
      : network.blobGatewayUrl
    return (
      (process.env.DEV ? '' : blobGatewayUrl) +
      '/api' +
      (token.logoStoreType === db.StoreType.S3
        ? '/file/v1'
        : '/blobs/chains/' +
          creationChain +
          '/applications/' +
          namedApplication.applicationId) +
      '/images/' +
      token.logo
    )
  }
}
