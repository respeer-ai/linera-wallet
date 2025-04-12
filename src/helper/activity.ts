import { ConfirmedBlock } from 'src/__generated__/graphql/service/graphql'
import { dbBridge } from 'src/bridge'
import { dbModel, rpcModel } from 'src/model'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'
import { parse } from 'lossless-json'

export class ActivityHelper {
  static updateBlockActivities = async (
    microchainId: string,
    block: ConfirmedBlock
  ) => {
    const microchain = await dbBridge.Microchain.microchain(microchainId)
    if (!microchain) return

    const nativeTokenId = (await dbBridge.Token.native())?.id || 1
    for (const bundle of block.block.body.incomingBundles || []) {
      const origin = bundle.origin as rpcModel.Origin
      for (const message of bundle.bundle.messages) {
        const _message = message.message as rpcModel.Message
        if (_message?.System?.Credit) {
          await dbBridge.Activity.create(
            microchain.microchain,
            nativeTokenId,
            origin.sender,
            _message?.System?.Credit?.source,
            block.block.header.chainId as string,
            _message?.System?.Credit?.target,
            _message?.System?.Credit?.amount,
            block.block.header.height as number,
            block.block.header.timestamp as number,
            block.hash as string,
            message.grant as string
          )
        } else if (_message?.User) {
          const token = (await dbBridge.Token.token(
            _message.User.applicationId
          )) as dbModel.Token
          const tokenId = token?.id || 2
          const memeMessageStr = await lineraWasm.bcs_deserialize_meme_message(
            `[${_message.User.bytes.toString()}]`
          )
          // TODO: it may not be Meme message here, we should deserialize it according to application bytecode
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const memeMessage = parse(memeMessageStr) as rpcModel.MemeMessage
          if (memeMessage?.Transfer) {
            await dbBridge.Activity.create(
              microchain.microchain,
              tokenId,
              memeMessage.Transfer.from.chainId,
              memeMessage.Transfer.from.owner,
              block.block.header.chainId as string,
              memeMessage.Transfer.to.owner,
              memeMessage.Transfer.amount,
              block.block.header.height as number,
              block.block.header.timestamp as number,
              block.hash as string,
              message.grant as string
            )
          }
        }
      }
    }
    for (const operation of block.block.body.operations || []) {
      const _operation = operation as rpcModel.Operation
      if (_operation.System?.Transfer) {
        let grant = undefined as unknown as string | undefined
        for (const messages of block.block.body.messages || []) {
          grant = messages.find((el) => {
            const destination = el.destination as rpcModel.Destination
            const message = el.message as rpcModel.Message
            return (
              destination?.Recipient ===
                _operation.System?.Transfer?.recipient.Account?.chainId &&
              message?.System?.Credit?.source ===
                _operation.System?.Transfer.owner &&
              message?.System?.Credit?.target ===
                _operation?.System.Transfer.recipient?.Account?.owner
            )
          })?.grant as string
          if (grant?.length) break
        }
        await dbBridge.Activity.create(
          microchain.microchain,
          nativeTokenId,
          block.block.header.chainId as string,
          _operation.System.Transfer.owner,
          _operation.System.Transfer.recipient.Account?.chainId as string,
          _operation.System.Transfer.recipient.Account?.owner,
          _operation.System.Transfer.amount,
          block.block.header.height as number,
          block.block.header.timestamp as number,
          block.hash as string,
          grant as string
        )
      }
    }
  }
}
