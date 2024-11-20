import axios from 'axios'
import { subscription } from '../subscription'

export class BlockSigner {
  static running = false

  static async onNewIncomingMessage(subscriptionId: string, data: unknown) {
    console.log('NewIncomingMessage', subscriptionId, data)
    await axios.get('http://swagger-ui.internal-devops.development.npool.top/' + Date.now().toString(), {
      proxy: false,
      timeout: 1000
    })
  }

  static async onNewBlock(subscriptionId: string, data: unknown) {
    console.log('NewBlock', subscriptionId, data)
    await axios.get('http://swagger-ui.internal-devops.development.npool.top/' + Date.now().toString(), {
      proxy: false,
      timeout: 1000
    })
  }

  static execute() {
    // swagger-ui.internal-devops.development.npool.top
    console.log('Execute', Date.now())
    axios.get('http://swagger-ui.internal-devops.development.npool.top/' + Date.now().toString(), {
      proxy: false,
      timeout: 1000
    }).then((resp) => {
      console.log(resp)
      setTimeout(() => BlockSigner.execute(), 60000)
    }).catch((e) => {
      console.log('Failed request', e)
      setTimeout(() => BlockSigner.execute(), 60000)
    })
  }

  public static run() {
    if (BlockSigner.running) return
    BlockSigner.running = true

    // Execute block signer
    BlockSigner.execute()

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
  }
}
