import { subscription } from '../subscription'
import { sharedStore } from '../store'
import { db, rpc } from '../../src/model'
import {
  BLOCK,
  BLOCK_MATERIAL,
  SIMULATE_EXECUTE_BLOCK,
  SUBMIT_BLOCK_AND_SIGNATURE
} from '../../src/graphql'
import { queryApplication } from '../middleware/rpcimpl/lineragraphqldo'
import { RpcGraphqlQuery } from '../middleware/types'
import {
  type CandidateBlockMaterial,
  type ExecutedBlock,
  type ExecutedBlockMaterial,
  type NotificationsSubscription
} from '../../src/__generated__/graphql/service/graphql'
import { sha3 } from 'hash-wasm'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { dbBase, dbWallet } from '../../src/controller'
import { _hex, graphqlResult } from '../../src/utils'
import { HashedConfirmedBlock } from 'src/__generated__/graphql/sdk/graphql'
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
    block: HashedConfirmedBlock
  ) => {
    const operations = await sharedStore.getChainOperations(
      microchain,
      undefined,
      [db.OperationState.EXECUTING, db.OperationState.EXECUTED],
      block.hash as string
    )
    for (const operation of operations) {
      if (operation.state !== db.OperationState.EXECUTED) {
        return setTimeout(() => {
          void BlockSigner.updateChainOperations(microchain, block)
        }, 1000)
      }
      operation.state = db.OperationState.CONFIRMED
      await dbWallet.chainOperations.update(operation.id, operation)
    }
  }

  static updateActivities = async (
    microchain: string,
    block: HashedConfirmedBlock
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const nativeTokenId = (await sharedStore.nativeToken())?.id || 1
    for (const bundle of block.value.block.body.incomingBundles || []) {
      const origin = bundle.origin as rpc.Origin
      for (const message of bundle.bundle.messages) {
        const _message = message.message as rpc.Message
        if (_message?.System?.Credit) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await sharedStore.createActivity(
            microchain,
            nativeTokenId,
            origin.sender,
            _message?.System?.Credit?.source,
            block.value.block.header.chainId as string,
            _message?.System?.Credit?.target,
            _message?.System?.Credit?.amount,
            block.value.block.header.height as number,
            block.value.block.header.timestamp as number,
            block.hash as string,
            message.grant as string
          )
        } else if (_message?.User) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const token = (await sharedStore.token(
            _message.User.application_id
          )) as db.Token
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
          const memeMessage = parse(memeMessageStr) as rpc.MemeMessage
          if (memeMessage?.Transfer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await sharedStore.createActivity(
              microchain,
              tokenId,
              memeMessage.Transfer.from.chain_id,
              memeMessage.Transfer.from.owner,
              block.value.block.header.chainId as string,
              memeMessage.Transfer.to.owner,
              memeMessage.Transfer.amount,
              block.value.block.header.height as number,
              block.value.block.header.timestamp as number,
              block.hash as string,
              message.grant as string
            )
          }
        }
      }
    }
    for (const operation of block.value.block.body.operations || []) {
      const _operation = operation as rpc.Operation
      if (_operation.System?.Transfer) {
        let grant = undefined as unknown as string | undefined
        for (const messages of block.value.block.body.messages || []) {
          grant = messages.find((el) => {
            const destination = el.destination as rpc.Destination
            const message = el.message as rpc.Message
            return (
              destination?.Recipient ===
                _operation.System?.Transfer?.recipient.Account?.chain_id &&
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
          block.value.block.header.chainId as string,
          _operation.System.Transfer.owner,
          _operation.System.Transfer.recipient.Account?.chain_id as string,
          _operation.System.Transfer.recipient.Account?.owner,
          _operation.System.Transfer.amount,
          block.value.block.header.height as number,
          block.value.block.header.timestamp as number,
          block.hash as string,
          grant as string
        )
      }
    }
  }

  static processNewBlock = async (microchain: string, hash?: string) => {
    const blockQuery = {
      query: {
        operationName: 'block',
        query: BLOCK.loc?.source?.body,
        variables: {
          chainId: microchain,
          hash
        }
      }
    } as RpcGraphqlQuery
    const block = (await queryApplication(
      microchain,
      blockQuery
    )) as HashedConfirmedBlock
    await BlockSigner.updateChainOperations(microchain, block)
    await BlockSigner.updateActivities(microchain, block)
    await BlockSigner.updateMicrochainOpenState(microchain, block)
  }

  static updateMicrochainOpenState = async (
    microchain: string,
    block: HashedConfirmedBlock
  ) => {
    const _microchain = (await sharedStore.getMicrochain(
      microchain
    )) as db.Microchain
    if (
      _microchain.state === db.MicrochainState.CLAIMING ||
      !_microchain.openChainCertificateHash
    ) {
      return setTimeout(() => {
        void BlockSigner.updateMicrochainOpenState(microchain, block)
      }, 1000)
    }
    if (_microchain.openChainCertificateHash === block.hash) {
      _microchain.state = db.MicrochainState.CREATED
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
      query: {
        operationName: 'blockMaterial',
        query: BLOCK_MATERIAL.loc?.source?.body,
        variables: {
          chainId: microchain,
          maxPendingMessages
        }
      }
    } as RpcGraphqlQuery
    return (await queryApplication(
      microchain,
      blockMaterialQuery
    )) as CandidateBlockMaterial
  }

  static async simulateExecuteBlock(
    microchain: string,
    blockMaterial: CandidateBlockMaterial,
    operation?: rpc.Operation
  ) {
    const simulateExecuteBlockQuery = {
      query: {
        operationName: 'simulateExecuteBlock',
        query: SIMULATE_EXECUTE_BLOCK.loc?.source?.body,
        variables: {
          chainId: microchain,
          blockMaterial: {
            operations: operation ? [operation] : [],
            candidate: blockMaterial
          }
        }
      }
    } as RpcGraphqlQuery
    return (await queryApplication(
      microchain,
      simulateExecuteBlockQuery
    )) as ExecutedBlockMaterial
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

  static async validateOperation(
    executedBlock: ExecutedBlock,
    operation: rpc.Operation
  ) {
    const executedOperation = executedBlock.block.operations[0] as rpc.Operation
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
    owner: db.Owner,
    payload: Uint8Array
  ): Promise<string> => {
    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject('Invalid password')
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid fingerprint')
    const _password = db.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = db.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )
    return _hex.toHex(keyPair.sign(new Memory(payload)).to_bytes().bytes)
  }

  static async submitBlockAndSignature(
    microchain: string,
    height: number,
    executedBlock: ExecutedBlock,
    round: rpc.Round,
    signature: string,
    validatedBlockCertificate?: unknown
  ): Promise<string> {
    const submitBlockAndSignatureQuery = {
      query: {
        operationName: 'submitBlockAndSignature',
        query: SUBMIT_BLOCK_AND_SIGNATURE.loc?.source?.body,
        variables: {
          chainId: microchain,
          height,
          block: {
            executedBlock,
            round,
            signature,
            validatedBlockCertificate
          }
        }
      }
    } as RpcGraphqlQuery
    return (await queryApplication(
      microchain,
      submitBlockAndSignatureQuery
    )) as string
  }

  static async processNewIncomingMessageWithOperation(
    microchain: string,
    _operation?: db.ChainOperation
  ): Promise<{ certificateHash: string; isRetryBlock: boolean }> {
    const operation = _operation
      ? (parse(_operation?.operation) as rpc.Operation)
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

    const executedBlockMaterial = await BlockSigner.simulateExecuteBlock(
      microchain,
      blockMaterial,
      operation
    )

    const executedBlock = executedBlockMaterial?.executedBlock
    const validatedBlockCertificate =
      executedBlockMaterial?.validatedBlockCertificate as unknown
    const isRetryBlock = !validatedBlockCertificate

    if (!executedBlock) return Promise.reject('Failed execute block')
    if (
      !isRetryBlock &&
      executedBlock.block.operations.length !== (operation ? 1 : 0)
    )
      return Promise.reject('Invalid operation count')

    if (operation && !isRetryBlock) {
      await BlockSigner.validateOperation(executedBlock, operation)
    }

    const block = executedBlock.block
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const payload = await lineraWasm.executed_block_payload(
      stringify(block, null, 2) as string,
      stringify(blockMaterial.round) as string,
      ''
    )
    const owner = (await sharedStore.microchainOwner(microchain)) as db.Owner
    if (!owner) return Promise.reject('Invalid owner')
    const signature = await BlockSigner.signPayload(
      owner,
      parse(payload) as Uint8Array
    )
    if (!signature) return Promise.reject('Failed generate signature')

    if (_operation) {
      _operation.state = db.OperationState.EXECUTING
      _operation.stateHash = (executedBlock.outcome.stateHash ||
        (executedBlock.outcome as unknown as Record<string, string>)
          .state_hash) as string
      await sharedStore.updateChainOperation(_operation)
    }

    const isOpenChain = stringify(executedBlock)?.includes('OpenChain')

    try {
      const certificateHash = await BlockSigner.submitBlockAndSignature(
        microchain,
        executedBlock.block.height as number,
        executedBlock,
        blockMaterial.round as rpc.Round,
        signature,
        validatedBlockCertificate
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
          .then((_microchain?: db.Microchain) => {
            if (!_microchain) return
            _microchain.state = db.MicrochainState.CLAIMED
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
        db.OperationState.CREATED,
        db.OperationState.EXECUTING,
        db.OperationState.EXECUTED
      ]
    )

    const processedMicrochains = new Map<string, boolean>()

    // TODO: merge operations of the same microchain
    for (const operation of operations) {
      if (
        operation.certificateHash &&
        operation.state === db.OperationState.EXECUTED
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

      const _operation = parse(operation.operation) as rpc.Operation

      if (_operation.User && !_operation.User.bytes) {
        operation.state = db.OperationState.FAILED
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
        operation.state = db.OperationState.EXECUTED
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
          operation.state = db.OperationState.FAILED
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
      )) as db.Microchain
      if (!_microchain) continue
      if (
        _microchain.openChainCertificateHash &&
        _microchain.state !== db.MicrochainState.CREATED
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
