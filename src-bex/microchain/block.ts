import { subscription } from '../subscription'
import { sharedStore } from '../store'
import { db, rpc } from '../../src/model'
import {
  BLOCK,
  BLOCK_MATERIAL,
  EXECUTE_BLOCK_WITH_FULL_MATERIALS,
  SUBMIT_BLOCK_AND_SIGNATURE
} from '../../src/graphql'
import { queryApplication } from '../middleware/rpcimpl/lineragraphqldo'
import { RpcGraphqlQuery } from '../middleware/types'
import {
  type Block,
  type CandidateBlockMaterial,
  type ExecutedBlock,
  type ExecutedBlockMaterial,
  type NotificationsSubscription
} from '../../src/__generated__/graphql/service/graphql'
import { sha3 } from 'hash-wasm'
import { toSnake } from 'ts-case-convert'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { dbBase, dbWallet } from '../../src/controller'
import { _hex, graphqlResult } from '../../src/utils'
import { HashedCertificateValue } from 'src/__generated__/graphql/sdk/graphql'
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
      await BlockSigner.processNewIncomingMessageWithOperation(_data.microchain)
      await BlockSigner.processNewBlock(_data.microchain)
    } catch {
      // DO NOTHING
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
    block: HashedCertificateValue
  ) => {
    const operations = await sharedStore.getChainOperations(
      microchain,
      undefined,
      [db.OperationState.EXECUTING, db.OperationState.EXECUTED],
      block.value.executedBlock?.outcome.stateHash as string
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
    block: HashedCertificateValue
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const nativeTokenId = (await sharedStore.nativeToken())?.id || 1
    for (const bundle of block?.value?.executedBlock?.block?.incomingBundles ||
      []) {
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
            block.value.executedBlock?.block.chainId as string,
            _message?.System?.Credit?.target,
            _message?.System?.Credit?.amount,
            block.value.executedBlock?.block.height as number,
            block.value.executedBlock?.block.timestamp as number,
            block.hash as string,
            message.grant as string
          )
        } else if (_message?.User) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const token = (await sharedStore.token(
            _message.User.application_id
          )) as db.Token
          const tokenId = token?.id || 2
          let erc20MessageStr = undefined as unknown as string
          try {
            erc20MessageStr = await lineraWasm.bcs_deserialize_erc20_message(
              `[${_message.User.bytes.toString()}]`
            )
          } catch (e) {
            console.log('Failed deserialize message', e)
            continue
          }
          // TODO: it may not be ERC20 message here, we should deserialize it according to application bytecode
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const erc20Message = parse(erc20MessageStr) as rpc.ERC20Message
          if (erc20Message?.Transfer) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await sharedStore.createActivity(
              microchain,
              tokenId,
              erc20Message.Transfer.origin.chain_id,
              erc20Message.Transfer.origin.owner,
              block.value.executedBlock?.block.chainId as string,
              erc20Message.Transfer.to.owner,
              erc20Message.Transfer.amount,
              block.value.executedBlock?.block.height as number,
              block.value.executedBlock?.block.timestamp as number,
              block.hash as string,
              message.grant as string
            )
          }
        }
      }
    }
    for (const operation of block?.value?.executedBlock?.block.operations ||
      []) {
      const _operation = operation as rpc.Operation
      if (_operation.System?.Transfer) {
        let grant = undefined as unknown as string | undefined
        for (const messages of block?.value?.executedBlock?.outcome?.messages ||
          []) {
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
          block.value.executedBlock?.block.chainId as string,
          _operation.System.Transfer.owner,
          _operation.System.Transfer.recipient.Account?.chain_id as string,
          _operation.System.Transfer.recipient.Account?.owner,
          _operation.System.Transfer.amount,
          block.value.executedBlock?.block.height as number,
          block.value.executedBlock?.block.timestamp as number,
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
    )) as HashedCertificateValue
    await BlockSigner.updateChainOperations(microchain, block)
    await BlockSigner.updateActivities(microchain, block)
    await BlockSigner.updateMicrochainOpenState(microchain, block)
  }

  static updateMicrochainOpenState = async (
    microchain: string,
    block: HashedCertificateValue
  ) => {
    const _microchain = (await sharedStore.getMicrochain(
      microchain
    )) as db.Microchain
    if (_microchain.openChainCertificateHash === block.hash) {
      _microchain.opened = true
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
      await BlockSigner.processNewBlock(microchain, hash)
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

  static async executeBlockWithFullMaterials(
    microchain: string,
    blockMaterial: CandidateBlockMaterial,
    operation?: rpc.Operation
  ) {
    const executeBlockWithFullMaterialsQuery = {
      query: {
        operationName: 'executeBlockWithFullMaterials',
        query: EXECUTE_BLOCK_WITH_FULL_MATERIALS.loc?.source?.body,
        variables: {
          chainId: microchain,
          operations: operation ? [operation] : [],
          incomingBundles: blockMaterial.incomingBundles,
          localTime: blockMaterial.localTime
        }
      }
    } as RpcGraphqlQuery
    return (await queryApplication(
      microchain,
      executeBlockWithFullMaterialsQuery
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

  static formalizeExecutedBlockBlock(executedBlock: ExecutedBlock) {
    return parse(
      stringify(executedBlock.block) as string,
      function (this: Record<string, unknown>, key: string, value: unknown) {
        if (value === null) return
        if (
          key.length &&
          typeof key === 'string' &&
          key.slice(0, 1).toLowerCase() === key.slice(0, 1) &&
          key.toLowerCase() !== key
        ) {
          const _key = toSnake(key)
          if (!_key.includes('_') || _key === key) return value
          if (this) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this[_key] = value
          }
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value
      }
    ) as Block
  }

  static formalizeExecutedBlock(executedBlock: ExecutedBlock) {
    return parse(
      stringify(executedBlock) as string,
      function (this: Record<string, unknown>, key: string, value: unknown) {
        if (value === null) return
        if (
          key.length &&
          typeof key === 'string' &&
          key.slice(0, 1).toLowerCase() === key.slice(0, 1) &&
          key.toLowerCase() !== key
        ) {
          const _key = toSnake(key)
          if (!_key.includes('_') || _key === key) return value
          if (this) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this[_key] = value
          }
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value
      }
    ) as ExecutedBlock
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
    retry: boolean,
    validatedBlockCertificateHash?: string
  ): Promise<string> {
    const submitBlockAndSignatureQuery = {
      query: {
        operationName: 'submitBlockAndSignature',
        query: SUBMIT_BLOCK_AND_SIGNATURE.loc?.source?.body,
        variables: {
          chainId: microchain,
          height,
          executedBlock,
          round,
          signature,
          retry,
          validatedBlockCertificateHash
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

    const executedBlockMaterial =
      await BlockSigner.executeBlockWithFullMaterials(
        microchain,
        blockMaterial,
        operation
      )

    const executedBlock = executedBlockMaterial?.executedBlock
    const validatedBlockCertificateHash =
      executedBlockMaterial?.validatedBlockCertificateHash as string
    const isRetryBlock = executedBlockMaterial?.retry

    if (!executedBlock) return Promise.reject('Failed execute block')
    if (
      !isRetryBlock &&
      executedBlock.block.operations.length !== (operation ? 1 : 0)
    )
      return Promise.reject('Invalid operation count')

    if (operation && !isRetryBlock) {
      await BlockSigner.validateOperation(executedBlock, operation)
    }

    const block = BlockSigner.formalizeExecutedBlockBlock(executedBlock)
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

    const _executedBlock = BlockSigner.formalizeExecutedBlock(executedBlock)

    if (_operation) {
      _operation.state = db.OperationState.EXECUTING
      _operation.stateHash = (_executedBlock.outcome.stateHash ||
        (_executedBlock.outcome as unknown as Record<string, string>)
          .state_hash) as string
      await sharedStore.updateChainOperation(_operation)
    }

    const isOpenChain = stringify(_executedBlock)?.includes('OpenChain')

    try {
      const certificateHash = await BlockSigner.submitBlockAndSignature(
        microchain,
        executedBlock.block.height as number,
        _executedBlock,
        blockMaterial.round as rpc.Round,
        signature,
        isRetryBlock,
        validatedBlockCertificateHash
      )

      if (continueProcess) {
        BlockSigner.messageCompensates.set(
          microchain,
          setTimeout(() => {
            void BlockSigner.processNewIncomingMessageWithOperation(microchain)
          }, 1000) as unknown as number
        )
      }

      if (isOpenChain) {
        sharedStore
          .getMicrochain(microchain)
          .then((_microchain?: db.Microchain) => {
            if (!_microchain) return
            _microchain.opening = true
            _microchain.openChainCertificateHash = certificateHash
            void sharedStore.updateMicrochain(_microchain)
          })
          .catch((e) => {
            console.log('Failed update mirochain', e)
          })
      }

      return { certificateHash, isRetryBlock }
    } catch (e) {
      if (blockMaterial.incomingBundles.length > 0) {
        if (BlockSigner.messageCompensates.has(microchain)) {
          clearTimeout(BlockSigner.messageCompensates.get(microchain))
          BlockSigner.messageCompensates.delete(microchain)
        }
        BlockSigner.messageCompensates.set(
          microchain,
          setTimeout(() => {
            void BlockSigner.processNewIncomingMessageWithOperation(microchain)
          }, 1000) as unknown as number
        )
      }
      return Promise.reject(e)
    }
  }

  static async processOperations() {
    const operations = await sharedStore.getChainOperations(
      undefined,
      undefined,
      [db.OperationState.CREATED, db.OperationState.EXECUTING]
    )
    // TODO: merge operations of the same microchain
    for (const operation of operations) {
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
  }

  static execute() {
    BlockSigner.processOperations()
      .then(() => {
        setTimeout(() => BlockSigner.execute(), 1000)
      })
      .catch((e) => {
        console.log('Failed process operations', e)
        setTimeout(() => BlockSigner.execute(), 1000)
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
