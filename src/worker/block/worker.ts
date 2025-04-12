import {
  BlockEvent,
  BlockEventType,
  BlockRunner,
  NewBlockPayload,
  NewIncomingBundlePayload,
  NewOperationPayload
} from './runner'
import initWasm from '../../../src-bex/wasm/linera_wasm'
import wasmModuleUrl from '../../../src-bex/wasm/linera_wasm_bg.wasm?url'
import { Berith } from '@hazae41/berith'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()
let wasmInitialized = false

self.onmessage = async (message: MessageEvent) => {
  if (!wasmInitialized) {
    await mutex.runExclusive(async () => {
      if (wasmInitialized) return
      let _wasmModuleUrl = wasmModuleUrl.startsWith('/')
        ? wasmModuleUrl
        : `/www/${wasmModuleUrl}`
      try {
        await initWasm(await fetch(_wasmModuleUrl))
      } catch (e) {
        // TODO: workaround for chrome load path
        _wasmModuleUrl = _wasmModuleUrl.includes('/www')
          ? _wasmModuleUrl
          : `/www${_wasmModuleUrl}`
        await initWasm(await fetch(_wasmModuleUrl))
      }
      await Berith.initBundledOnce()
      wasmInitialized = true
    })
  }

  const event = message.data as BlockEvent
  switch (event.type) {
    case BlockEventType.NEW_BLOCK:
      return await BlockRunner.handleBlock(event.payload as NewBlockPayload)
    case BlockEventType.NEW_INCOMING_BUNDLE:
      return await BlockRunner.handleIncomingBundle(
        event.payload as NewIncomingBundlePayload
      )
    case BlockEventType.NEW_OPERATION:
      return await BlockRunner.handleOperation(
        event.payload as NewOperationPayload
      )
    case BlockEventType.RUN_TICKER:
      return await BlockRunner.handleTicker()
  }
}
