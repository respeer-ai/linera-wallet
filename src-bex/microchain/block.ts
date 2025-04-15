import { subscription } from '../subscription'
import { type NotificationsSubscription } from '../../src/__generated__/graphql/service/graphql'
import { graphqlResult } from '../../src/utils'
import { blockWorker } from '../../src/worker'
import { dbBridge } from '../../src/bridge'
import { BexBridge, BexPayload } from '@quasar/app-vite'

export class BlockSigner {
  static running = false
  static messageCompensates = new Map<string, number>()

  static async onInitialized(subscriptionId: string, data: unknown) {
    const _data = data as Record<string, string>
    if (
      !_data ||
      !_data.topic ||
      _data.topic !== 'Initialized' ||
      !_data.microchain
    )
      return

    const tokens = await dbBridge.Token.fungibles()
    const memeChain =
      tokens.findIndex((el) => el.creatorChainId === _data.microchain) >= 0

    if (!memeChain) {
      await blockWorker.BlockRunner.handleIncomingBundle({
        microchain: _data.microchain
      })
    }

    await blockWorker.BlockRunner.handleBlock({
      microchain: _data.microchain,
      memeChain
    })
  }

  static async onNewIncomingMessage(subscriptionId: string, data: unknown) {
    if (!data || !graphqlResult.rootData(data)) return
    const notifications = (
      graphqlResult.rootData(data) as NotificationsSubscription
    ).notifications as Record<string, unknown>
    const microchain = notifications.chain_id as string
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newIncomingBundle = graphqlResult.keyValue(
      reason,
      'NewIncomingBundle'
    )
    if (newIncomingBundle) {
      const tokens = await dbBridge.Token.fungibles()
      const memeChain =
        tokens.findIndex((el) => el.creatorChainId === microchain) >= 0

      if (!memeChain) {
        await blockWorker.BlockRunner.handleIncomingBundle({
          microchain
        })
      }
    }
  }

  static processNewBlock = async (microchain: string, hash?: string) => {
    const tokens = await dbBridge.Token.fungibles()
    const memeChain =
      tokens.findIndex((el) => el.creatorChainId === microchain) >= 0
    await blockWorker.BlockRunner.handleBlock({
      microchain,
      hash,
      memeChain
    })
  }

  static async onNewBlock(subscriptionId: string, data: unknown) {
    if (!data || !graphqlResult.rootData(data)) return
    const notifications = (
      graphqlResult.rootData(data) as NotificationsSubscription
    ).notifications as Record<string, unknown>
    const microchain = notifications.chain_id as string
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newBlock = graphqlResult.keyValue(reason, 'NewBlock')
    if (newBlock) {
      const hash = graphqlResult.keyValue(newBlock, 'hash') as string
      await BlockSigner.processNewBlock(microchain, hash)
    }
  }

  static async onNewOperation(subscriptionId: string, data: unknown) {
    const _data = data as Record<string, string>
    if (
      !_data ||
      !_data.topic ||
      _data.topic !== 'NewOperation' ||
      !_data.microchain
    )
      return

    await blockWorker.BlockRunner.handleOperation(
      data as blockWorker.NewOperationPayload
    )
  }

  static handleNewOperation = (
    payload: BexPayload<blockWorker.NewOperationPayload, unknown>
  ) => {
    blockWorker.BlockRunner.handleOperation(payload.data)
      .then(() => {
        void payload.respond({})
      })
      .catch((e) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Failed process operation: ${e}`)
      })
  }

  public static run(bridge: BexBridge) {
    bridge.off('new-operation', BlockSigner.handleNewOperation)
    bridge.on('new-operation', BlockSigner.handleNewOperation)

    if (BlockSigner.running) return
    BlockSigner.running = true

    void blockWorker.BlockRunner.handleTicker()

    // Subscribe message and block
    subscription.Subscription.subscribe(
      ['NewIncomingMessage'],
      (subscriptionId: string, data: unknown) =>
        BlockSigner.onNewIncomingMessage(subscriptionId, data)
    )

    // Subscribe message and block
    subscription.Subscription.subscribe(
      ['NewBlock'],
      (subscriptionId: string, data: unknown) =>
        BlockSigner.onNewBlock(subscriptionId, data)
    )

    // Subscribe initialized
    subscription.Subscription.subscribe(
      ['Initialized'],
      (subscriptionId: string, data: unknown) =>
        BlockSigner.onInitialized(subscriptionId, data)
    )

    // Subscribe new operation
    subscription.Subscription.subscribe(
      ['NewOperation'],
      (subscriptionId: string, data: unknown) =>
        BlockSigner.onNewOperation(subscriptionId, data)
    )
  }
}
