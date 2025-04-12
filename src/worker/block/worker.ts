import { BlockEvent, BlockEventType, BlockRunner } from './runner'

setTimeout(BlockRunner.handleTicker, 30000)

self.onmessage = async (message: MessageEvent) => {
  const event = message.data as BlockEvent
  switch (event.type) {
    case BlockEventType.NEW_BLOCK:
      return await BlockRunner.handleBlock(event.payload)
    case BlockEventType.NEW_INCOMING_BUNDLE:
      return BlockRunner.handleIncomingBundle()
    case BlockEventType.NEW_OPERATION:
      return BlockRunner.handleOperation()
  }
}
