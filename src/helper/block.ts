import {
  type Block,
  type CandidateBlockMaterial,
  type SimulatedBlockMaterial
} from 'src/__generated__/graphql/service/graphql'
import { dbBridge, rpcBridge } from 'src/bridge'
import { dbModel, rpcModel } from 'src/model'
import { parse, stringify } from 'lossless-json'
import { sha3 } from 'hash-wasm'
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
    block: Block,
    operation: rpcModel.Operation
  ) => {
    const executedOperation = block.body.operations[0] as rpcModel.Operation
    const operationHash = await sha3(
      stringify(BlockHelper.sortedObject(operation), (key, value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (value !== null) return value
      }) as string
    )
    const executedOperationHash = await sha3(
      stringify(BlockHelper.sortedObject(executedOperation), (key, value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (value !== null) return value
      }) as string
    )
    if (operationHash !== executedOperationHash) {
      throw Error('Invalid operation payload')
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

    const _block = simulatedBlock?.block
    if (!_block) throw Error('Invalid block')

    const validatedBlockCertificate =
      simulatedBlock?.validatedBlockCertificate as unknown
    const isRetryBlock = !!validatedBlockCertificate

    if (_operation && !isRetryBlock) {
      await BlockHelper.validateOperation(_block, _operation)
    }

    return {
      simulatedBlock,
      isRetryBlock
    }
  }

  static blockPayload = async (
    simulatedBlock: SimulatedBlockMaterial,
    material: CandidateBlockMaterial
  ) => {
    return await lineraWasm.block_payload(
      stringify(simulatedBlock.block, null, 2) as string,
      stringify(material.round) as string,
      stringify(simulatedBlock.outcome) as string
    )
  }

  static signPayload = async (microchain: string, payload: Uint8Array) => {
    const owner = (await dbBridge.Microchain.microchainOwner(
      microchain
    )) as dbModel.Owner
    if (!owner) throw Error('Invalid owner')
    const signature = await rpcBridge.Block.signPayload(owner, payload)
    if (!signature) throw Error('Failed generate signature')
    return signature
  }

  static submitBlockWithSignature = async (
    microchain: string,
    simulatedBlock: SimulatedBlockMaterial,
    material: CandidateBlockMaterial,
    operation: dbModel.ChainOperation | undefined,
    signature: string
  ) => {
    return await rpcBridge.Block.submitBlockAndSignature(
      microchain,
      simulatedBlock.block.header.height as number,
      simulatedBlock.block,
      material.round as rpcModel.Round,
      signature,
      simulatedBlock.validatedBlockCertificate,
      operation
        ? await dbBridge.ChainOperation.operationBlobs(operation.operationId)
        : []
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
    const blockPayload = await BlockHelper.blockPayload(
      simulatedBlock,
      material
    )
    const signature = await BlockHelper.signPayload(
      microchain,
      JSON.parse(blockPayload) as Uint8Array
    )
    const certificateHash = await BlockHelper.submitBlockWithSignature(
      microchain,
      simulatedBlock,
      material,
      operation,
      signature
    )

    await MicrochainHelper.claimedInBlock(
      microchain,
      simulatedBlock.block,
      certificateHash
    )

    return {
      certificateHash,
      moreIncomingBundle,
      isRetryBlock
    }
  }
}
