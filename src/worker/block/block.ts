import {
  BlockEvent,
  BlockEventType,
  BlockProcessedPayload,
  NewBlockPayload,
  NewIncomingBundlePayload,
  NewOperationPayload
} from './runner'

type BlockResponseType = BlockProcessedPayload
export type ListenerFunc = (payload: BlockResponseType) => Promise<void>

export class BlockWorker {
  // eslint-disable-next-line no-use-before-define
  private static _instance: BlockWorker | undefined = undefined

  private _worker: Worker | undefined = undefined
  // eslint-disable-next-line func-call-spacing
  private _listeners: Map<BlockEventType, ListenerFunc[]> = new Map<
    BlockEventType,
    ListenerFunc[]
  >()

  private constructor() {
    this._worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    })

    this._worker.onmessage = async (message: MessageEvent) => {
      const event = message.data as BlockEvent
      const listeners = this._listeners.get(event.type) || []
      for (const listener of listeners) {
        await listener(event.payload as BlockResponseType)
      }
    }
  }

  public static getBlockWorker = () => {
    if (BlockWorker._instance) return BlockWorker._instance
    BlockWorker._instance = new BlockWorker()

    if (window.location.origin.startsWith('http')) {
      BlockWorker.send(BlockEventType.RUN_TICKER)
    }

    return BlockWorker._instance
  }

  public static send = (
    type: BlockEventType,
    payload?: NewBlockPayload | NewIncomingBundlePayload | NewOperationPayload
  ) => {
    BlockWorker.getBlockWorker()._worker?.postMessage({
      type,
      payload
    })
  }

  public static on = (type: BlockEventType, listener: ListenerFunc) => {
    const listeners = BlockWorker.getBlockWorker()._listeners.get(type) || []
    if (listeners.findIndex((el) => el === listener)) return
    listeners.push(listener)
    BlockWorker.getBlockWorker()._listeners.set(type, listeners)
    console.log('On', type)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static off = (type: BlockEventType, listener: ListenerFunc) => {
    const listeners = BlockWorker.getBlockWorker()._listeners.get(type) || []
    const index = listeners.findIndex((el) => el === listener)
    if (index < 0) return
    listeners.splice(index, 1)
    BlockWorker.getBlockWorker()._listeners.set(type, listeners)
    console.log('Off', type)
  }

  public static terminate = () => {
    BlockWorker.getBlockWorker()._worker?.terminate()
  }
}
