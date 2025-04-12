import {
  BlockEventType,
  NewBlockPayload,
  NewIncomingBundlePayload,
  NewOperationPayload
} from './runner'

export class BlockWorker {
  // eslint-disable-next-line no-use-before-define
  private static _instance: BlockWorker | undefined = undefined

  private _worker: Worker | undefined = undefined

  private constructor() {
    this._worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    })
  }

  public static getBlockWorker = () => {
    if (BlockWorker._instance) return BlockWorker._instance
    BlockWorker._instance = new BlockWorker()
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

  public static terminate = () => {
    BlockWorker.getBlockWorker()._worker?.terminate()
  }
}
