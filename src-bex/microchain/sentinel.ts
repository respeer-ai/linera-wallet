import wasmModuleUrl from '../wasm/linera_wasm_bg.wasm?url'
import initWasm from '../wasm/linera_wasm'
import { Berith } from '@hazae41/berith'

export class Sentinel {
  static running = false

  public static async run() {
    if (Sentinel.running) return
    Sentinel.running = true

    try {
      const buffer = await fetch(wasmModuleUrl)
      await initWasm(buffer)

      await Berith.initBundledOnce()
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed load wasm ${e}`)
    }
  }
}
