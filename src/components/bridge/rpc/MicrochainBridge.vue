<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { _hex, graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { dbBase } from 'src/controller'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { CHAINS_WITH_PUBLIC_KEY, WALLET_INIT_WITHOUT_KEYPAIR, OPEN_CHAIN } from 'src/graphql'

const openChain = async (publicKey: string): Promise<rpc.OpenChainResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(OPEN_CHAIN))
  const res = await mutate({
    publicKey
  })
  return {
    chainId: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'chainId') as string,
    messageId: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'messageId') as string,
    certificateHash: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'certificateHash') as string
  } as rpc.OpenChainResp
}

const initMicrochainStore = async (keyPair: Ed25519SigningKey, chainId: string, messageId: string, certificateHash: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const faucetUrl = (await dbBase.networks.toArray()).find((el) => el.selected)?.faucetUrl

  const typeNameBytes = new TextEncoder().encode('Nonce::')
  const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(certificateHash)])
  const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(WALLET_INIT_WITHOUT_KEYPAIR))
  return await mutate({
    publicKey: _hex.toHex(keyPair.public().to_bytes().bytes),
    signature,
    faucetUrl,
    chainId,
    messageId,
    certificateHash
  })
}

const chains = async (publicKey: string): Promise<rpc.ChainsResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(CHAINS_WITH_PUBLIC_KEY, {
    publicKey
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const chains = graphqlResult.data(res, 'chainsWithPublicKey') as rpc.ChainsResp
      resolve(chains)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get microchains: ${error}`))
    })
  })
}

defineExpose({
  openChain,
  initMicrochainStore,
  chains
})

</script>
