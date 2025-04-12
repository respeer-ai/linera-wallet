import { subscription } from '../subscription'
import { sharedStore } from '../store'
import { dbModel, rpcModel } from '../../src/model'
import {
  BLOCK,
  BLOCK_MATERIAL,
  SIMULATE_EXECUTE_BLOCK,
  SUBMIT_BLOCK_AND_SIGNATURE_BCS
} from '../../src/graphql'
import { queryDo } from '../middleware/rpcimpl/lineragraphqldo'
import { RpcGraphqlQuery } from '../middleware/types'
import {
  type CandidateBlockMaterial,
  type Block,
  type SimulatedBlockMaterial,
  type ConfirmedBlock,
  type NotificationsSubscription
} from '../../src/__generated__/graphql/service/graphql'
import { sha3 } from 'hash-wasm'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { dbBase, dbWallet } from '../../src/controller'
import { _hex, graphqlResult } from '../../src/utils'
import { parse, stringify } from 'lossless-json'

export class BlockSigner {
  static running = false
  static messageCompensates = new Map<string, number>()

  static async onInitialized(subscriptionId: string, data: unknown) {
    const _data = data as Record<string, string>
    if (
      !_data ||
      !_data.topic ||
      _data.topic !== 'Initialized' ||
      !_data.microchain
    )
      return
    try {
      await BlockSigner.processNewIncomingMessageWithOperation(_data.microchain)
    } catch (e) {
      console.log('Failed process incoming message', e)
    }

    try {
      await BlockSigner.processNewBlock(_data.microchain)
    } catch (e) {
      console.log('Failed process new block', e)
    }
  }

  static async onNewIncomingMessage(subscriptionId: string, data: unknown) {
    if (!data || !graphqlResult.rootData(data)) return
    const notifications = (
      graphqlResult.rootData(data) as NotificationsSubscription
    ).notifications as Record<string, unknown>
    const microchain = notifications.chain_id as string
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newIncomingBundle = graphqlResult.keyValue(
      reason,
      'NewIncomingBundle'
    )
    if (newIncomingBundle) {
      try {
        await BlockSigner.processNewIncomingMessageWithOperation(microchain)
      } catch (e) {
        console.log('Failed process incoming message', e)
      }
    }
  }

  static updateChainOperations = async (
    microchain: string,
    block: ConfirmedBlock
  ) => {
    const operations = await sharedStore.getChainOperations(
      microchain,
      block.hash as string,
      [dbModel.OperationState.EXECUTING, dbModel.OperationState.EXECUTED]
    )
    for (const operation of operations) {
      if (operation.state !== dbModel.OperationState.EXECUTED) {
        return setTimeout(() => {
          void BlockSigner.updateChainOperations(microchain, block)
        }, 1000)
      }
      operation.state = dbModel.OperationState.CONFIRMED
      await dbWallet.chainOperations.update(operation.id, operation)
    }
  }

  static updateActivities = async (
    microchain: string,
    block: ConfirmedBlock
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const nativeTokenId = (await sharedStore.nativeToken())?.id || 1
    for (const bundle of block.block.body.incomingBundles || []) {
      const origin = bundle.origin as rpcModel.Origin
      for (const message of bundle.bundle.messages) {
        const _message = message.message as rpcModel.Message
        if (_message?.System?.Credit) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await sharedStore.createActivity(
            microchain,
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const token = (await sharedStore.token(
            _message.User.applicationId
          )) as dbModel.Token
          const tokenId = token?.id || 2
          let memeMessageStr = undefined as unknown as string
          try {
            memeMessageStr = await lineraWasm.bcs_deserialize_meme_message(
              `[${_message.User.bytes.toString()}]`
            )
          } catch (e) {
            console.log('Failed deserialize message', e)
            continue
          }
          // TODO: it may not be ERC20 message here, we should deserialize it according to application bytecode
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const memeMessage = parse(memeMessageStr) as rpcModel.MemeMessage
          if (memeMessage?.Transfer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await sharedStore.createActivity(
              microchain,
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await sharedStore.createActivity(
          microchain,
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

  static processNewBlock = async (microchain: string, hash?: string) => {
    const blockQuery = {
      operationName: 'block',
      query: {
        query: BLOCK.loc?.source?.body,
        variables: {
          chainId: microchain,
          hash
        }
      }
    } as RpcGraphqlQuery
    const block = (await queryDo(microchain, blockQuery)) as ConfirmedBlock
    await BlockSigner.updateChainOperations(microchain, block)
    await BlockSigner.updateActivities(microchain, block)
    await BlockSigner.updateMicrochainOpenState(microchain, block)
  }

  static updateMicrochainOpenState = async (
    microchain: string,
    block: ConfirmedBlock
  ) => {
    const _microchain = (await sharedStore.getMicrochain(
      microchain
    )) as dbModel.Microchain
    if (
      _microchain.state === dbModel.MicrochainState.CLAIMING ||
      !_microchain.openChainCertificateHash
    ) {
      return setTimeout(() => {
        void BlockSigner.updateMicrochainOpenState(microchain, block)
      }, 1000)
    }
    if (_microchain.openChainCertificateHash === block.hash) {
      _microchain.state = dbModel.MicrochainState.CREATED
      await sharedStore.updateMicrochain(_microchain)
    }
  }

  static async onNewBlock(subscriptionId: string, data: unknown) {
    if (!data || !graphqlResult.rootData(data)) return
    const notifications = (
      graphqlResult.rootData(data) as NotificationsSubscription
    ).notifications as Record<string, unknown>
    const microchain = notifications.chain_id as string
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newBlock = graphqlResult.keyValue(reason, 'NewBlock')
    if (newBlock) {
      const hash = graphqlResult.keyValue(newBlock, 'hash') as string
      try {
        await BlockSigner.processNewBlock(microchain, hash)
      } catch {
        // DO NOTHING
      }
    }
  }

  static async getBlockMaterial(
    microchain: string,
    maxPendingMessages: number
  ) {
    const blockMaterialQuery = {
      operationName: 'blockMaterial',
      query: {
        query: BLOCK_MATERIAL.loc?.source?.body,
        variables: {
          chainId: microchain,
          maxPendingMessages
        }
      }
    } as RpcGraphqlQuery
    return (await queryDo(
      microchain,
      blockMaterialQuery
    )) as CandidateBlockMaterial
  }

  static async simulateExecuteBlock(
    microchain: string,
    blockMaterial: CandidateBlockMaterial,
    operation?: rpcModel.Operation,
    blobBytes?: Array<Uint8Array>
  ) {
    const simulateExecuteBlockQuery = {
      operationName: 'simulateExecuteBlock',
      query: {
        query: SIMULATE_EXECUTE_BLOCK.loc?.source?.body,
        variables: {
          chainId: microchain,
          blockMaterial: {
            operations: operation ? [operation] : [],
            blobBytes: (blobBytes || []).map((el) => Array.from(el)),
            candidate: blockMaterial
          }
        }
      }
    } as RpcGraphqlQuery
    return (await queryDo(
      microchain,
      simulateExecuteBlockQuery
    )) as SimulatedBlockMaterial
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
        _sortedObject[key] = BlockSigner.sortedObject(
          value as Record<string, unknown>
        )
      } else {
        _sortedObject[key] = value
      }
    }

    return _sortedObject
  }

  static async validateOperation(block: Block, operation: rpcModel.Operation) {
    const executedOperation = block.body.operations[0] as rpcModel.Operation
    const operationHash = await sha3(
      stringify(BlockSigner.sortedObject(operation), (key, value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (value !== null) return value
      }) as string
    )
    const executedOperationHash = await sha3(
      stringify(BlockSigner.sortedObject(executedOperation), (key, value) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (value !== null) return value
      }) as string
    )
    if (operationHash !== executedOperationHash) {
      return Promise.reject('Invalid operation payload')
    }
  }

  static signPayload = async (
    owner: dbModel.Owner,
    payload: Uint8Array
  ): Promise<string> => {
    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject('Invalid password')
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid fingerprint')
    const _password = dbModel.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = dbModel.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )
    return _hex.toHex(keyPair.sign(new Memory(payload)).to_bytes().bytes)
  }

  static async submitBlockAndSignature(
    microchain: string,
    height: number,
    block: Block,
    round: rpcModel.Round,
    signature: string,
    validatedBlockCertificate: unknown | undefined,
    blobBytes: Array<Uint8Array>
  ): Promise<string> {
    const signedBlock = {
      block,
      round,
      signature: {
        Ed25519: signature
      },
      validatedBlockCertificate,
      // Uint8Array will be serialized to map so we use number array here
      blobBytes: Array.from(blobBytes.map((bytes) => Array.from(bytes)))
    }
    const bcsStr = await lineraWasm.bcs_serialize_signed_block(
      stringify(signedBlock) as string
    )
    const bcsBytes = Array.from(parse(bcsStr) as number[])
    const bcsHex = _hex.toHex(new Uint8Array(bcsBytes))

    const submitBlockAndSignatureQuery = {
      query: {
        // query: SUBMIT_BLOCK_AND_SIGNATURE.loc?.source?.body,
        query: SUBMIT_BLOCK_AND_SIGNATURE_BCS.loc?.source?.body,
        variables: {
          chainId: microchain,
          height,
          // TODO: we have to use bcs here due to issue https://github.com/linera-io/linera-protocol/issues/3734
          block: bcsHex
          /*
          block: {
            block,
            round,
            signature: {
              Ed25519: signature
            },
            validatedBlockCertificate,
            // Uint8Array will be serialized to map so we use number array here
            blobBytes: Array.from(blobBytes.map((bytes) => Array.from(bytes)))
          }
          */
        }
      },
      operationName: 'submitBlockAndSignatureBcs'
    } as RpcGraphqlQuery
    return (await queryDo(microchain, submitBlockAndSignatureQuery)) as string
  }

  static async processNewIncomingMessageWithOperation(
    microchain: string,
    _operation?: dbModel.ChainOperation
  ): Promise<{ certificateHash: string; isRetryBlock: boolean }> {
    const operation = _operation
      ? (parse(_operation?.operation) as rpcModel.Operation)
      : undefined

    if (BlockSigner.messageCompensates.has(microchain)) {
      clearTimeout(BlockSigner.messageCompensates.get(microchain))
      BlockSigner.messageCompensates.delete(microchain)
    }

    const maxProcessBundles = 2
    const blockMaterial = await BlockSigner.getBlockMaterial(
      microchain,
      maxProcessBundles
    )

    if (!operation && blockMaterial.incomingBundles.length === 0) {
      return Promise.resolve({
        certificateHash: undefined as unknown as string,
        isRetryBlock: false
      })
    }

    const continueProcess =
      blockMaterial.incomingBundles.length >= maxProcessBundles

    const simulatedBlockMaterial = await BlockSigner.simulateExecuteBlock(
      microchain,
      blockMaterial,
      operation,
      _operation ? await sharedStore.operationBlobs(_operation.operationId) : []
    )

    const block = simulatedBlockMaterial?.block
    const validatedBlockCertificate =
      simulatedBlockMaterial?.validatedBlockCertificate as unknown
    const isRetryBlock = !!validatedBlockCertificate

    if (!block) return Promise.reject('Failed execute block')
    if (!isRetryBlock && block.body.operations.length !== (operation ? 1 : 0))
      return Promise.reject('Invalid operation count')

    if (operation && !isRetryBlock) {
      await BlockSigner.validateOperation(block, operation)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await lineraWasm.block_payload(
      stringify(block, null, 2) as string,
      stringify(blockMaterial.round) as string,
      stringify(simulatedBlockMaterial.outcome) as string
    )
    const owner = (await sharedStore.microchainOwner(
      microchain
    )) as dbModel.Owner
    if (!owner) return Promise.reject('Invalid owner')
    const signature = await BlockSigner.signPayload(
      owner,
      parse(payload) as Uint8Array
    )
    if (!signature) return Promise.reject('Failed generate signature')

    if (_operation) {
      _operation.state = dbModel.OperationState.EXECUTING
      await sharedStore.updateChainOperation(_operation)
    }

    const isOpenChain = stringify(block)?.includes('OpenChain')
    const operationBlobBytes = _operation
      ? await sharedStore.operationBlobs(_operation.operationId)
      : []
    const blobBytes = (
      isRetryBlock ? simulatedBlockMaterial.blobBytes || [] : operationBlobBytes
    ) as Array<Uint8Array>

    try {
      const certificateHash = await BlockSigner.submitBlockAndSignature(
        microchain,
        block.header.height as number,
        block,
        blockMaterial.round as rpcModel.Round,
        signature,
        validatedBlockCertificate,
        blobBytes
      )

      if (continueProcess) {
        BlockSigner.messageCompensates.set(
          microchain,
          setTimeout(() => {
            BlockSigner.messageCompensates.delete(microchain)
            BlockSigner.processNewIncomingMessageWithOperation(microchain)
              .then(() => {
                // DO NOTHING
              })
              .catch((e) => {
                console.log('Failed process incoming bundles', e)
              })
          }, 1000) as unknown as number
        )
      }

      if (isOpenChain) {
        sharedStore
          .getMicrochain(microchain)
          .then((_microchain?: dbModel.Microchain) => {
            if (!_microchain) return
            _microchain.state = dbModel.MicrochainState.CLAIMED
            _microchain.openChainCertificateHash = certificateHash
            void sharedStore.updateMicrochain(_microchain)
          })
          .catch((e) => {
            console.log('Failed update mirochain', e)
          })
      }

      return { certificateHash, isRetryBlock }
    } catch (e) {
      return Promise.reject(e)
    }
  }

  static async processOperations() {
    const operations = await sharedStore.getChainOperations(
      undefined,
      undefined,
      [
        dbModel.OperationState.CREATED,
        dbModel.OperationState.EXECUTING,
        dbModel.OperationState.EXECUTED
      ]
    )

    const processedMicrochains = new Map<string, boolean>()

    // TODO: merge operations of the same microchain
    for (const operation of operations) {
      if (
        operation.certificateHash &&
        operation.state === dbModel.OperationState.EXECUTED
      ) {
        try {
          await BlockSigner.processNewBlock(
            operation.microchain,
            operation.certificateHash
          )
        } catch (e) {
          console.log('Failed process operation block', e)
        }
        continue
      }

      if (!operation.firstProcessedAt) {
        operation.firstProcessedAt = Date.now()
        await sharedStore.updateChainOperation(operation)
        console.log(
          `Operation ${operation.operationId} created at ${
            operation.createdAt || 0
          }, processing at ${operation.firstProcessedAt}`
        )
      }

      const _operation = parse(operation.operation) as rpcModel.Operation

      if (_operation.User && !_operation.User.bytes) {
        operation.state = dbModel.OperationState.FAILED
        operation.failReason = 'Invalid operation'
        operation.failedAt = Date.now()
        await sharedStore.updateChainOperation(operation)
        continue
      }

      processedMicrochains.set(operation.microchain, true)

      try {
        const { certificateHash, isRetryBlock } =
          await BlockSigner.processNewIncomingMessageWithOperation(
            operation.microchain,
            operation
          )
        if (isRetryBlock) continue
        operation.state = dbModel.OperationState.EXECUTED
        operation.certificateHash = certificateHash
        await sharedStore.updateChainOperation(operation)
      } catch (e) {
        if (stringify(e)?.includes('Was expecting block height')) {
          continue
        }
        if (
          stringify(e)?.includes(
            'is out of order compared to previous messages from'
          )
        ) {
          continue
        }
        if (operation.firstProcessedAt + 10 * 1000 < Date.now()) {
          console.log(
            `Operation ${operation.operationId} created at ${
              operation.createdAt || 0
            }, processing at ${
              operation.firstProcessedAt
            }, timeout at ${Date.now()}`
          )
          operation.state = dbModel.OperationState.FAILED
          operation.failedAt = Date.now()
          operation.failReason = stringify(e)
          await sharedStore.updateChainOperation(operation)
        }
        console.log('Failed process operation', e)
      }
    }

    const microchains = await sharedStore.getMicrochains()

    for (const microchain of microchains) {
      const _microchain = (await sharedStore.getMicrochain(
        microchain
      )) as dbModel.Microchain
      if (!_microchain) continue
      if (
        _microchain.openChainCertificateHash &&
        _microchain.state !== dbModel.MicrochainState.CREATED
      ) {
        try {
          await BlockSigner.processNewBlock(
            microchain,
            _microchain.openChainCertificateHash
          )
        } catch (e) {
          console.log('Failed process open chain block', e)
        }
      }
      if (!processedMicrochains.get(microchain)) {
        try {
          await BlockSigner.processNewIncomingMessageWithOperation(microchain)
        } catch (e) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed process incoming bundle: ${e}`)
        }
      }
    }
  }

  static execute() {
    BlockSigner.processOperations()
      .then(() => {
        setTimeout(() => BlockSigner.execute(), 10000)
      })
      .catch((e) => {
        console.log('Failed process operations', e)
        setTimeout(() => BlockSigner.execute(), 10000)
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

    // Subscribe initialized
    subscription.Subscription.subscribe(
      ['Initialized'],
      (subscriptionId: string, data: unknown) =>
        BlockSigner.onInitialized(subscriptionId, data)
    )
  }
}
