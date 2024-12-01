import { db } from 'src/model'
import { type ApplicationOverview } from 'src/__generated__/graphql/service/graphql'
import { Application } from './application'
import { ApplicationOperation } from './application_operation'
import { dbBridge } from '..'

export class MonoApplicationOperation {
  static subscribeCreationChainWithId = async (
    chainId: string,
    applicationId: string,
    applicationType: db.ApplicationType
  ) => {
    const applications = await Application.microchainApplications(chainId)
    if (!applications) return
    if (
      applications?.findIndex(
        (el: ApplicationOverview) => el.id === applicationId
      ) < 0
    )
      return
    await ApplicationOperation.subscribeCreatorChain(
      chainId,
      applicationId,
      applicationType
    )
  }

  static subscribeCreationChainWithType = async (
    chainId: string,
    applicationType: db.ApplicationType
  ) => {
    const application =
      (await dbBridge.NamedApplication.namedApplicationWithType(
        applicationType
      )) as db.NamedApplication
    if (!application) return
    await MonoApplicationOperation.subscribeCreationChainWithId(
      chainId,
      application.applicationId,
      applicationType
    )
  }
}
