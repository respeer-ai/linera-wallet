import { db } from 'src/model'
import { MonoApplicationOperation } from './mono_application_opeartion'

export class AMSApplicationOperation {
  static subscribeCreationChain = async (chainId: string, force?: boolean) => {
    await MonoApplicationOperation.subscribeCreationChainWithType(
      chainId,
      db.ApplicationType.AMS,
      force
    )
  }
}
