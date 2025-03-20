import { CREATOR_CHAIN_ID } from 'src/graphql'
import { ApplicationOperation } from './application_operation'

export class ApplicationCreatorChain {
  static id = async (chainId: string, applicationId: string) => {
    return await ApplicationOperation.queryApplication(chainId, applicationId, CREATOR_CHAIN_ID, 'creatorChainId') as unknown as string
  }
}
