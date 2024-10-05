<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { graphqlResult, _hex } from 'src/utils'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { db, rpc } from 'src/model'
import { dbBase } from 'src/controller'

const getPendingRawBlock = async (chainId: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingRawBlock($chainId: String!) {
      peekCandidateRawBlockPayload(chainId: $chainId) {
        height
        payloadBytes
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
      resolve(rawBlock)
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

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  return await mutate({
    chainId,
    height,
    signature
  })
}

const submitBlockAndSignature = async (chainId: string, height: number, executedBlock: rpc.ExecutedBlock, round: rpc.Round, signature: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockAndSignature ($chainId: String!, $height: Int!, $executedBlock: UserExecutedBlock!, $round: Round!, $signature: String!) {
      submitBlockAndSignature(chainId: $chainId, height: $height, executedBlock: $executedBlock, round: $round, signature: $signature)
    }`))
  return await mutate({
    chainId,
    height,
    executedBlock,
    round,
    signature
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

const subscribe = async (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: (hash: string) => void, onNewIncomingBundle?: () => void) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription notifications($chainId: String!) {
      notifications(chainId: $chainId)
    }
  `, {
    chainId
  }))

  onError((error) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Fail subscribe to ${chainId}: ${error}`)
  })

  onResult((res) => {
    const notifications = graphqlResult.data(res, 'notifications')
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
}

const getBlockWithHash = async (chainId: string, hash: string): Promise<rpc.BlockResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query block($chainId: String!, $hash: String!) {
      block(chainId: $chainId, hash: $hash) {
        hash
        value {
          status
          executedBlock {
            block {
              chainId
              epoch
              incomingBundles {
                origin
                action
                bundle
              }
              operations
              height
              timestamp
              authenticatedSigner
              previousBlockHash
            }
            outcome {
              messages {
                destination
                authenticatedSigner
                grant
                refundGrantTo
                kind
                message
              }
              stateHash
              oracleResponses
              events {
                streamId {
                  applicationId
                  streamName
                }
                key
                value
              }
            }
          }
        }
      }
    }
  `, {
    chainId,
    hash
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const block = graphqlResult.data(res, 'block') as rpc.BlockResp
      resolve(block)
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
