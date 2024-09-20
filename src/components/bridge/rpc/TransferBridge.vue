<script setup lang='ts'>
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { _hex, endpoint } from 'src/utils'

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number, userData?: string) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const userDataBytes = userData ? _hex.toBytes(userData) : undefined

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation transfer ($fromPublicKey: String, $fromChainId: String!, $toPublicKey: String, $toChainId: String!, $amount: String!, $userData: String) {
      transferWithoutBlockProposal(fromPublicKey: $fromPublicKey, fromChainId: $fromChainId, toPublicKey: $toPublicKey, toChainId: $toChainId, amount: $amount, userData: $userData)
    }`))

  await mutate({
    fromPublicKey,
    fromChainId,
    toPublicKey,
    toChainId,
    amount,
    userData: userDataBytes
  })
}

defineExpose({
  transfer
})

</script>
