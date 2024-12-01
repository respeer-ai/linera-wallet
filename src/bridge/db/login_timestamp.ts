import { dbBase } from 'src/controller'

export class LoginTimestamp {
  static save = async () => {
    return new Promise((resolve, reject) => {
      dbBase.lastLogin
        .count()
        .then(async (cnt) => {
          if (cnt === 0) {
            await dbBase.lastLogin.add({ timestamp: Date.now() })
          } else {
            const ts = (await dbBase.lastLogin.toArray()).find(() => true)
            await dbBase.lastLogin.update(ts?.id, { timestamp: Date.now() })
          }
          resolve(undefined)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  static loginTimeout = async (): Promise<boolean> => {
    const timestamp = (await dbBase.lastLogin.toArray()).find(
      () => true
    )?.timestamp
    return (
      timestamp === undefined || timestamp < Date.now() - 4 * 60 * 60 * 1000
    )
  }
}
