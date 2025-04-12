import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'

export class ChainOperationHelper {
  static executedInBlock = (microchain: string, block: ConfirmedBlock) => {
    console.log(microchain, block)
  }
}
