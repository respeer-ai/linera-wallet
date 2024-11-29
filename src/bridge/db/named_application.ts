import { dbWallet } from 'src/controller'
import { db } from 'src/model'

export class NamedApplication {
  static create = async (namedApplication: db.NamedApplication) => {
    await dbWallet.namedApplications.add(namedApplication)
  }

  static update = async (namedApplication: db.NamedApplication) => {
    await dbWallet.namedApplications.update(namedApplication.id, namedApplication)
  }

  static delete = async (id: number) => {
    await dbWallet.namedApplications.delete(id)
  }

  static namedApplicationWithType = async (applicationType: db.ApplicationType): Promise<db.NamedApplication | undefined> => {
    return (await dbWallet.namedApplications.toArray()).find((el) => el.applicationType === applicationType)
  }
}
