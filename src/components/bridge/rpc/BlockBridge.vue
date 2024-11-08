<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { graphqlResult, _hex } from 'src/utils'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { db, rpc } from 'src/model'
import { dbBase } from 'src/controller'
import { GET_PENDING_RAW_BLOCK, SUBMIT_BLOCK_SIGNATURE, SUBMIT_BLOCK_AND_SIGNATURE, NOTIFICATIONS, BLOCK } from 'src/graphql'
import { type BlockQuery, type GetPendingRawBlockQuery, type NotificationsSubscription, type HashedCertificateValue, type ExecutedBlock } from 'src/__generated__/graphql/service/graphql'

const getPendingRawBlock = async (chainId: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(GET_PENDING_RAW_BLOCK, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve((graphqlResult.rootData(res) as GetPendingRawBlockQuery).peekCandidateRawBlockPayload)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get pending block: ${error}`))
    })
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(SUBMIT_BLOCK_SIGNATURE))
  return await mutate({
    chainId,
    height,
    signature
  })
}

const submitBlockAndSignature = async (chainId: string, height: number, executedBlock: ExecutedBlock, round: rpc.Round, signature: string, retry: boolean, validatedBlockCertificateHash?: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(SUBMIT_BLOCK_AND_SIGNATURE))
  return await mutate({
    chainId,
    height,
    executedBlock,
    round,
    signature,
    retry,
    validatedBlockCertificateHash
  })
}

const signNewBlock = async (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey) => {
  const rawBlockAndRound = await getPendingRawBlock(chainId)
  if (!rawBlockAndRound) return
  const payloadBytes = graphqlResult.keyValue(rawBlockAndRound, 'payloadBytes')
  const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
  const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
  await submitBlockSignature(chainId, height, signature)
}

const signPayload = async (owner: db.Owner, payload: Uint8Array): Promise<string> => {
  const password = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!password) return Promise.reject('Invalid password')
  const _password = db.decryptPassword(password)
  const privateKey = db.privateKey(owner, _password)
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  return _hex.toHex(keyPair.sign(new Memory(payload)).to_bytes().bytes)
}

const subscribe = async (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: (hash: string) => void, onNewIncomingBundle?: () => void): Promise<() => void> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ stop, onResult, onError } = provideApolloClient(apolloClient)(() => useSubscription(NOTIFICATIONS, {
    chainId
  }))

  onError((error) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Fail subscribe to ${chainId}: ${error}`)
  })

  onResult((res) => {
    const notifications = (graphqlResult.rootData(res) as NotificationsSubscription).notifications as unknown
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newRawBlock = graphqlResult.keyValue(reason, 'NewRawBlock')
    if (newRawBlock) {
      onNewRawBlock?.(graphqlResult.keyValue(newRawBlock, 'height') as number)
    }
    const newBlock = graphqlResult.keyValue(reason, 'NewBlock')
    if (newBlock) {
      onNewBlock?.(graphqlResult.keyValue(newBlock, 'hash') as string)
    }
    const newIncomingBundle = graphqlResult.keyValue(reason, 'NewIncomingBundle')
    if (newIncomingBundle) {
      onNewIncomingBundle?.()
    }
  })

  return stop
}

const getBlockWithHash = async (chainId: string, hash: string): Promise<HashedCertificateValue> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(BLOCK, {
    chainId,
    hash
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve((graphqlResult.rootData(res) as BlockQuery).block as HashedCertificateValue)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get block: ${error}`))
    })
  })
}

defineExpose({
  signNewBlock,
  subscribe,
  getBlockWithHash,
  submitBlockAndSignature,
  signPayload
})

</script>
