import { dbBase } from 'src/controller'
import { db } from 'src/model'

export class Token {
  static create = async (token: db.Token) => {
    if ((await dbBase.tokens.toArray()).findIndex((el) => el.applicationId === token.applicationId) >= 0) return
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
    return (await dbBase.tokens.toArray()).filter((el) => el.tokenType === db.TokenType.Fungible)
  }

  static token = async (applicationId: string) => {
    return (await dbBase.tokens.toArray()).find((el) => el.applicationId === applicationId)
  }

  static tokens = async (offset: number, limit: number): Promise<db.Token[]> => {
    return (await dbBase.tokens.offset(offset).limit(limit).toArray())
  }

  static count = async () => {
    return await dbBase.tokens.count()
  }

  static tokenWithId = async (id: number) => {
    return (await dbBase.tokens.toArray()).find((el) => el.id === id)
  }
}
