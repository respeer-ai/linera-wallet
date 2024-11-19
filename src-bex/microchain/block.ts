import axios from 'axios'

export class BlockSigner {
  static running = false

  static delay = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  static async execute() {
    while (true) {
      // swagger-ui.internal-devops.development.npool.top
      console.log('Execute', Date.now())
      axios.get('http://swagger-ui.internal-devops.development.npool.top/' + Date.now().toString(), {
        proxy: false,
        timeout: 1000
      }).then((resp) => {
        console.log(resp)
      }).catch((e) => {
        console.log('Failed request', e)
      })
      await BlockSigner.delay(1000)
    }
  }

  public static run() {
    if (BlockSigner.running) return
    BlockSigner.running = true
    void BlockSigner.execute()
  }
}
