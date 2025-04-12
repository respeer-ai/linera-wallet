import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'

export class ActivityHelper {
  static updateBlockActivities = (
    microchain: string,
    block: ConfirmedBlock
  ) => {
    console.log(microchain, block)
  }
}
