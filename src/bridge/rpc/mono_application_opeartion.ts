import { db } from 'src/model'
import { type ApplicationOverview } from 'src/__generated__/graphql/service/graphql'
import { Application } from './application'
import { ApplicationOperation } from './application_operation'
import { dbBridge } from '..'

export class MonoApplicationOperation {
  static subscribeCreationChainWithId = async (chainId: string, applicationId: string, applicationType: db.ApplicationType, force?: boolean): Promise<boolean> => {
    const applications = await Application.microchainApplications(chainId)
    if (!applications) return false
    if (applications?.findIndex((el: ApplicationOverview) => el.id === applicationId) < 0) return false
    return await ApplicationOperation.subscribeCreatorChain(chainId, applicationId, applicationType, force) === true
  }

  static subscribeCreationChainWithType = async (chainId: string, applicationType: db.ApplicationType, force?: boolean): Promise<boolean> => {
    const application = await dbBridge.NamedApplication.namedApplicationWithType(applicationType) as db.NamedApplication
    if (!application) return false
    return await MonoApplicationOperation.subscribeCreationChainWithId(chainId, application.applicationId, applicationType, force)
  }
}
