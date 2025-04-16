import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'
import { dbBridge, rpcBridge } from 'src/bridge'
import {
  ActivityHelper,
  BalanceHelper,
  BlockHelper,
  ChainOperationHelper,
  MicrochainHelper
} from 'src/helper'
import { dbModel } from 'src/model'

export enum BlockEventType {
  NEW_OPERATION = 'NewOperation',
  NEW_INCOMING_BUNDLE = 'NewIncomingBundle',
  NEW_BLOCK = 'NewBlock',
  BLOCK_PROCESSED = 'BlockProcessed',
  RUN_TICKER = 'RunTicker'
}

export interface BasePayload {
  microchain: string
}

export interface NewBlockPayload extends BasePayload {
  hash?: string
  memeChain: boolean
}

export type NewIncomingBundlePayload = BasePayload

export interface NewOperationPayload extends BasePayload {
  operationId: string
}

export interface BlockProcessedPayload {
  microchain: string
}

export interface BlockEvent {
  type: BlockEventType
  payload: NewBlockPayload | NewIncomingBundlePayload | NewOperationPayload
}

const respond = self.postMessage

export class BlockRunner {
  static tickerHandle = undefined as unknown

  static handleInflightOperations = async () => {
    const operations = await ChainOperationHelper.inflightOperations()
    for (const operation of operations) {
      if (!operation.certificateHash) continue
      await BlockRunner.handleBlock({
        microchain: operation.microchain,
        hash: operation.certificateHash,
        memeChain: false
      })
    }
  }

  static handleErrorOperations = async () => {
    const operations = await ChainOperationHelper.errorOperations()
    for (const operation of operations) {
      await BlockRunner.handleOperation({
        microchain: operation.microchain,
        operationId: operation.operationId
      })
      // TODO: let user process operations which is in processing but not error
    }
  }

  static handleClaimedMicrochains = async () => {
    const microchains = await dbBridge.Microchain.microchains(0, 0, undefined, [
      dbModel.MicrochainState.CREATED
    ])
    for (const microchain of microchains) {
      if (!microchain.openChainCertificateHash) continue

      if (microchain.state === dbModel.MicrochainState.CREATED) {
        await BlockRunner.handleBlock({
          microchain: microchain.microchain,
          hash: microchain.openChainCertificateHash,
          memeChain: false
        })
        continue
      }
      await BlockRunner.handleIncomingBundle({
        microchain: microchain.microchain
      })
    }
  }

  // We have to run ticker each 30 seconds for network disconnection sometimes
  static handleTicker = async () => {
    if (BlockRunner.tickerHandle)
      clearTimeout(BlockRunner.tickerHandle as number)

    BlockRunner.tickerHandle = setTimeout(() => {
      void BlockRunner.handleTicker()
    }, 30000)

    try {
      await BlockRunner.handleInflightOperations()
      await BlockRunner.handleErrorOperations()
      await BlockRunner.handleClaimedMicrochains()
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed process ticker ${e}`)
    }

    // TODO: peek message
  }

  static handleConfirmedBlock = async (
    microchain: string,
    block: ConfirmedBlock,
    memeChain: boolean
  ) => {
    if (!block) return
    await ActivityHelper.updateBlockActivities(microchain, block)

    let needRetry = false
    if (!memeChain) {
      needRetry = await ChainOperationHelper.executedInBlock(microchain, block)
      needRetry ||= !(await MicrochainHelper.openedInBlock(microchain, block))
    }

    if (needRetry) {
      setTimeout(() => {
        void BlockRunner.handleConfirmedBlock(microchain, block, memeChain)
      }, 1000)
    }
  }

  static handleBlock = async (payload: NewBlockPayload) => {
    const { microchain, hash, memeChain } = payload

    // Meme chain is not our chain so we don't sync the balance
    if (memeChain) {
      await BalanceHelper.updateMemeBalances(microchain)
    } else {
      await BalanceHelper.updateNativeBalances(microchain)
    }

    const block = await rpcBridge.Block.getBlockWithHash(
      microchain,
      hash,
      memeChain
    )
    if (!block) return

    await BlockRunner.handleConfirmedBlock(microchain, block, memeChain)

    respond?.({
      type: BlockEventType.BLOCK_PROCESSED,
      payload: {
        microchain
      }
    })
  }

  static handleIncomingBundle = async (payload: NewIncomingBundlePayload) => {
    const { microchain } = payload

    try {
      const { moreIncomingBundle } = await BlockHelper.proposeNewBlock(
        microchain
      )

      if (moreIncomingBundle) {
        setTimeout(() => {
          void BlockRunner.handleIncomingBundle(payload)
        }, 100)
      }
    } catch (e) {
      // We don't retry here, it'll retried in ticker
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed handle incoming bundle: ${e}`)
    }
  }

  static handleOperation = async (payload: NewOperationPayload) => {
    const { microchain, operationId } = payload
    let _isRetryBlock = false
    let _certificateHash = undefined as unknown as string
    let _moreIncomingBundle = false

    await ChainOperationHelper.executingOperation(operationId)

    try {
      const { certificateHash, moreIncomingBundle, isRetryBlock } =
        await BlockHelper.proposeNewBlock(microchain, operationId)

      _isRetryBlock = isRetryBlock || _isRetryBlock
      _certificateHash = certificateHash || _certificateHash
      _moreIncomingBundle = moreIncomingBundle || _moreIncomingBundle
    } catch (e) {
      await ChainOperationHelper.tryTimeoutOperation(
        operationId,
        JSON.stringify(e)
      )
      return
      // It'll be retried in ticker
      // For operations which is still CREATED, UI should post again
    }

    try {
      if (!_isRetryBlock) {
        await ChainOperationHelper.submittedWithHash(
          operationId,
          _certificateHash
        )
        await ChainOperationHelper.tryFirstProcessOperation(operationId)
      }

      if (_moreIncomingBundle) {
        setTimeout(() => {
          void BlockRunner.handleIncomingBundle(payload)
        }, 100)
      }
    } catch (e) {
      await ChainOperationHelper.tryTimeoutOperation(
        operationId,
        JSON.stringify(e)
      )
    }
  }
}
