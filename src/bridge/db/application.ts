import { dbModel } from 'src/model'
import { MicrochainOwner } from './microchain_owner'
import { dbWallet } from 'src/controller'

export class Application {
  static ownerApplications = async (
    owner: string
  ): Promise<dbModel.Application[]> => {
    const microchainOwners = await MicrochainOwner.ownerMicrochainOwners(owner)
    return (
      (await dbWallet.applications.toArray()).filter((application) => {
        return (
          microchainOwners.findIndex(
            (el) =>
              el.owner === owner &&
              el.microchain === application.creationMicrochain
          ) >= 0
        )
      }) || []
    )
  }

  static create = async (
    applicationId: string,
    microchain: string,
    height: number,
    index: number
  ): Promise<dbModel.Application> => {
    let application = await dbWallet.applications
      .where('applicationId')
      .equals(applicationId)
      .first()
    if (application) return application
    application = {
      applicationId,
      creationMicrochain: microchain,
      creationHeight: height,
      applicationIndex: index
    } as dbModel.Application
    await dbWallet.applications.add(application)
    return application
  }
}
