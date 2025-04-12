import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'

export class MicrochainHelper {
  static openedInBlock = (microchain: string, block: ConfirmedBlock) => {
    console.log(microchain, block)
  }
}
