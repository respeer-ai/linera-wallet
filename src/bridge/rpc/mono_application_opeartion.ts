import { db } from 'src/model'
import { ApplicationOperation } from './application_operation'
import * as dbBridge from '../db'

export class MonoApplicationOperation {
  static subscribeCreationChainWithId = async (
    chainId: string,
    applicationId: string,
    applicationType: db.ApplicationType
  ) => {
    const exist = await ApplicationOperation.existChainApplication(
      chainId,
      applicationId
    )
    if (!exist) {
      console.log(`${applicationId} not exists on ${chainId}`)
      return
    }
    console.log('Subscribe creation chain', chainId, applicationId, applicationType)
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
