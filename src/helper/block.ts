import {
  type Operation,
  type UnsignedBlockProposal,
  type CandidateBlockMaterial,
  type SimulatedBlockMaterial,
  type InputUnsignedBlockProposal,
  InputProposalContent
} from 'src/__generated__/graphql/service/graphql'
import { dbBridge, rpcBridge } from 'src/bridge'
import { dbModel, rpcModel } from 'src/model'
import { parse, stringify } from 'lossless-json'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'
import { MicrochainHelper } from './microchain'

export class BlockHelper {
  static MAX_INCOMING_BUNDLES = 2

  static blockMaterial = async (microchain: string) => {
    const material = await rpcBridge.BlockMaterial.getBlockMaterial(
      microchain,
      BlockHelper.MAX_INCOMING_BUNDLES
    )
    return {
      material,
      moreIncomingBundle:
        material?.incomingBundles?.length >= BlockHelper.MAX_INCOMING_BUNDLES
    }
  }

  static sortedObject = (
    obj: Record<string, unknown>
  ): Record<string, unknown> => {
    const sortedKeys = Object.keys(obj).sort()
    const _sortedObject: Record<string, unknown> = {}
    for (const key of sortedKeys) {
      const value = obj[key]
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        _sortedObject[key] = BlockHelper.sortedObject(
          value as Record<string, unknown>
        )
      } else {
        _sortedObject[key] = value
      }
    }
    return _sortedObject
  }

  static validateOperation = async (
    block: UnsignedBlockProposal,
    operation: rpcModel.Operation
  ) => {
    const executedOperation = block.content.block.transactionMetadata.find(
      (tx) => tx.operation
    )?.operation

    const _operationStr = await lineraWasm.operation_metadata(
      stringify(operation) as string
    )
    const metadata = parse(_operationStr) as Operation
    if (
      metadata.applicationId !== executedOperation?.applicationId ||
      metadata.operationType !== executedOperation?.operationType ||
      metadata.systemBytesHex !== executedOperation.systemBytesHex ||
      metadata.userBytesHex !== executedOperation.userBytesHex
    ) {
      throw Error('Operation metadata mismatch')
    }
  }

  static simulateExecute = async (
    microchain: string,
    operation: dbModel.ChainOperation | undefined,
    candidate: CandidateBlockMaterial
  ) => {
    const _operation = operation
      ? (parse(operation.operation) as rpcModel.Operation)
      : undefined

    const simulatedBlock = await rpcBridge.SimulatedBlock.simulateExecuteBlock(
      microchain,
      _operation ? [_operation] : [],
      operation
        ? await dbBridge.ChainOperation.operationBlobs(operation.operationId)
        : [],
      candidate
    )

    const _block = simulatedBlock?.blockProposal
    if (!_block) throw Error('Invalid block')

    const originalProposal = simulatedBlock?.blockProposal
      ?.originalProposal as unknown
    const isRetryBlock = !!originalProposal

    if (_operation && !isRetryBlock) {
      await BlockHelper.validateOperation(_block, _operation)
    }

    return {
      simulatedBlock,
      isRetryBlock
    }
  }

  static blockPayload = async (simulatedBlock: SimulatedBlockMaterial) => {
    return await lineraWasm.block_payload(
      stringify(simulatedBlock.blockProposal.content) as string
    )
  }

  static deserializeProposalContent = async (
    simulatedBlock: SimulatedBlockMaterial
  ): Promise<InputUnsignedBlockProposal> => {
    const contentStr = await lineraWasm.deserialize_proposal_content(
      stringify(simulatedBlock.blockProposal.content) as string
    )
    const content = parse(contentStr) as InputProposalContent
    return {
      ...simulatedBlock.blockProposal,
      content
    }
  }

  static signPayload = async (microchain: string, payload: Uint8Array) => {
    const owner = (await dbBridge.Microchain.microchainOwner(
      microchain
    )) as dbModel.Owner
    if (!owner) throw Error('Invalid owner')
    const signature = await rpcBridge.Block.signPayload(owner, payload)
    if (!signature) throw Error('Failed generate signature')
    const publicKeyHex = await rpcBridge.Block.publicKeyHex(owner)
    if (!publicKeyHex) throw Error('Failed get public key')
    return { signature, publicKeyHex }
  }

  static submitSignedBlock = async (
    microchain: string,
    simulatedBlock: SimulatedBlockMaterial,
    signature: string,
    publicKeyHex: string
  ) => {
    const inputBlock = await BlockHelper.deserializeProposalContent(
      simulatedBlock
    )
    return await rpcBridge.Block.submitSignedBlock(
      microchain,
      inputBlock,
      signature,
      simulatedBlock.blobBytes,
      publicKeyHex
    )
  }

  static proposeNewBlock = async (microchain: string, operationId?: string) => {
    const operation = operationId
      ? await dbBridge.ChainOperation.get(operationId)
      : undefined

    const { material, moreIncomingBundle } = await BlockHelper.blockMaterial(
      microchain
    )
    if (!material.incomingBundles.length && !operationId)
      return { certificateHash: undefined, moreIncomingBundle: false }

    const { simulatedBlock, isRetryBlock } = await BlockHelper.simulateExecute(
      microchain,
      operation,
      material
    )
    const blockPayload = await BlockHelper.blockPayload(simulatedBlock)
    const { signature, publicKeyHex } = await BlockHelper.signPayload(
      microchain,
      JSON.parse(blockPayload) as Uint8Array
    )
    const certificateHash = await BlockHelper.submitSignedBlock(
      microchain,
      simulatedBlock,
      signature,
      publicKeyHex
    )

    await MicrochainHelper.claimedInBlock(
      microchain,
      simulatedBlock.blockProposal,
      certificateHash
    )

    return {
      certificateHash,
      moreIncomingBundle,
      isRetryBlock
    }
  }
}
