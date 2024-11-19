import wasmModuleUrl from '../wasm/linera_wasm_bg.wasm?url'
import initWasm from '../wasm/linera_wasm'
import { subscription } from '../subscription'
import * as lineraWasm from '../wasm/linera_wasm'

export class Sentinel {
  static running = false

  static async onMessage(subscriptionId: string, data: unknown) {
    console.log(subscriptionId, data)
    console.log('dApp query', await lineraWasm.dapp_query(10))
  }

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

    subscription.Subscription.subscribe(
      ['NewIncomingMessage'],
      (subscriptionId: string, data: unknown) =>
        Sentinel.onMessage(subscriptionId, data)
    )
  }
}
