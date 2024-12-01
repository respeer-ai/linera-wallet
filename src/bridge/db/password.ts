import { dbBase } from 'src/controller'
import { db } from 'src/model'

export class Password {
  static resetActive = async () => {
    for (const passwd of (await dbBase.passwords.toArray()).filter(
      (el) => el.active
    )) {
      await dbBase.passwords.update(passwd.id, { active: false })
    }
  }

  static password = async () => {
    const passwd = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!passwd) return undefined
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return undefined
    return db.decryptPassword(passwd, fingerPrint.fingerPrint)
  }

  static save = async (passwd?: string) => {
    const password = await Password.password()
    if (!passwd?.length && !password?.length) {
      throw Error('Invalid password')
    }
    await Password.resetActive()
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid finterprint')
    const _passwd = db.buildPassword(
      passwd || password || '',
      fingerPrint.fingerPrint
    )
    if (_passwd) {
      await dbBase.passwords.add(_passwd)
    }
  }

  static verify = async (passwd: string) => {
    const pwd = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!pwd) return false
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid finterprint')
    return db.decryptPassword(pwd, fingerPrint.fingerPrint) === passwd
  }
}
