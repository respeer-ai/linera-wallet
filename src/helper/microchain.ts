import {
  type Block,
  type ConfirmedBlock
} from 'src/__generated__/graphql/service/graphql'
import { stringify } from 'lossless-json'
import { dbBridge } from 'src/bridge'
import { dbModel } from 'src/model'

export class MicrochainHelper {
  static claimedInBlock = async (
    microchain: string,
    block: Block,
    certificateHash: string
  ) => {
    const isOpenChain = stringify(block)?.includes('OpenChain')
    if (!isOpenChain) return
    const _microchain = await dbBridge.Microchain.microchain(microchain)
    if (!_microchain) return
    _microchain.state = dbModel.MicrochainState.CLAIMED
    _microchain.openChainCertificateHash = certificateHash
    void dbBridge.Microchain.update(_microchain)
  }

  static openedInBlock = async (microchain: string, block: ConfirmedBlock) => {
    const _microchain = (await dbBridge.Microchain.microchain(
      microchain
    )) as dbModel.Microchain
    if (
      _microchain.state === dbModel.MicrochainState.CLAIMING ||
      !_microchain.openChainCertificateHash
    ) {
      return false
    }
    if (_microchain.openChainCertificateHash === block.hash) {
      _microchain.state = dbModel.MicrochainState.CREATED
      await dbBridge.Microchain.update(_microchain)
      return true
    }
    return false
  }
}
