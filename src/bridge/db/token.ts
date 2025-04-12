import { dbBase } from 'src/controller'
import { dbModel } from 'src/model'
import * as constant from '../../const'

export class Token {
  static initialize = async (nativeLogo: string) => {
    if (await Token.native()) return
    dbModel.lineraToken.logo = nativeLogo
    await dbBase.tokens.add(dbModel.lineraToken)
  }

  static create = async (token: dbModel.Token) => {
    if (
      (await dbBase.tokens.toArray()).findIndex(
        (el) => el.applicationId === token.applicationId
      ) >= 0
    )
      return
    await dbBase.tokens.add(token)
  }

  static update = async (token: dbModel.Token) => {
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
      (el) => el.tokenType === dbModel.TokenType.Fungible
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
    applicationIds?: string[],
    creatorChainId?: string
  ): Promise<dbModel.Token[]> => {
    return await dbBase.tokens
      .filter(
        (op) =>
          (creatorChainId === undefined ||
            op.creatorChainId === creatorChainId) &&
          (applicationIds === undefined ||
            applicationIds.length === 0 ||
            applicationIds.includes(op.applicationId as string))
      )
      .offset(offset)
      .limit(limit || 9999)
      .toArray()
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

    const blobGatewayUrl = constant.APPLICATION_URLS.BLOB_GATEWAY
    return blobGatewayUrl + '/images/' + token.logo
  }
}
