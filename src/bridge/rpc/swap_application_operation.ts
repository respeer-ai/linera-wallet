import { db } from 'src/model'
import { MonoApplicationOperation } from './mono_application_opeartion'

export class SwapApplicationOperation {
  static subscribeCreationChain = async (chainId: string, force?: boolean): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return await MonoApplicationOperation.subscribeCreationChainWithType(chainId, db.ApplicationType.SWAP, force) || false
  }
}
