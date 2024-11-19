import axios from 'axios'

export class BlockSigner {
  static running = false

  static execute() {
    // swagger-ui.internal-devops.development.npool.top
    console.log('Execute', Date.now())
    axios.get('http://swagger-ui.internal-devops.development.npool.top/' + Date.now().toString(), {
      proxy: false,
      timeout: 1000
    }).then((resp) => {
      console.log(resp)
      setTimeout(() => BlockSigner.execute(), 1000)
    }).catch((e) => {
      console.log('Failed request', e)
      setTimeout(() => BlockSigner.execute(), 1000)
    })
  }

  public static run() {
    if (BlockSigner.running) return
    BlockSigner.running = true
    void BlockSigner.execute()
  }
}
