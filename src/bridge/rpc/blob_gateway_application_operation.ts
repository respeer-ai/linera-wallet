import { db } from 'src/model'
import { MonoApplicationOperation } from './mono_application_opeartion'

export class BlobGatewayApplicationOperation {
  static subscribeCreationChain = async (chainId: string) => {
    await MonoApplicationOperation.subscribeCreationChainWithType(
      chainId,
      db.ApplicationType.BLOB_GATEWAY
    )
  }
}
