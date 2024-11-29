import { dbWallet } from 'src/controller'

export class ApplicationCreatorChainSubscription {
  static subscribed = async (microchain: string, applicationId: string) => {
    return (await dbWallet.applicationCreatorChainSubscriptions.toArray()).findIndex((el) => el.microchain === microchain && el.applicationId === applicationId) >= 0
  }

  static create = async (microchain: string, applicationId: string) => {
    if (await ApplicationCreatorChainSubscription.subscribed(microchain, applicationId)) return
    await dbWallet.applicationCreatorChainSubscriptions.add({
      microchain,
      applicationId
    })
  }
}
