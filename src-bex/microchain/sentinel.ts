import wasmModuleUrl from '../wasm/linera_wasm_bg.wasm?url'
import initWasm from '../wasm/linera_wasm'

export class Sentinel {
  static running = false

  public static run() {
    if (Sentinel.running) return
    Sentinel.running = true

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    fetch(wasmModuleUrl)
      .then((buffer) => {
        void initWasm(buffer)
      })
      .catch(() => {
        // TODO
      })
  }
}
