import { rpcBridge } from 'src/bridge'
import {
  ActivityHelper,
  BalanceHelper,
  ChainOperationHelper,
  MicrochainHelper
} from 'src/helper'

export enum BlockEventType {
  NEW_OPERATION = 'NewOperation',
  NEW_INCOMING_BUNDLE = 'NewIncomingBundle',
  NEW_BLOCK = 'NewBlock'
}

export interface NewBlockPayload {
  microchain: string
  hash: string
}

export interface BlockEvent {
  type: BlockEventType
  payload: NewBlockPayload
}

export class BlockRunner {
  // We have to run ticker each 30 seconds for network disconnection sometimes
  static handleTicker = () => {
    setTimeout(BlockRunner.handleTicker, 30000)

    // TODO: peek message
  }

  static handleBlock = async (payload: unknown) => {
    const { microchain, hash } = payload as NewBlockPayload
    // TODO: update balances
    BalanceHelper.updateBalances(microchain)
    // TODO: get block
    const block = await rpcBridge.Block.getBlockWithHash(microchain, hash)
    if (!block) return
    // TODO: update activities
    ActivityHelper.updateBlockActivities(microchain, block)
    // TODO: update chain operations
    ChainOperationHelper.executedInBlock(microchain, block)
    // TODO: update microchain open state
    MicrochainHelper.openedInBlock(microchain, block)
  }

  static handleIncomingBundle = () => {
    // TODO
  }

  static handleOperation = () => {
    // TODO
  }
}
