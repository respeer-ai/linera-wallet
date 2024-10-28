<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { _hex } from 'src/utils'
import { TRANSFER } from 'src/graphql'

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number, userData?: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const userDataBytes = userData ? _hex.toBytes(userData) : undefined

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(TRANSFER))

  await mutate({
    fromPublicKey,
    fromChainId,
    toPublicKey,
    toChainId,
    amount: amount.toString(),
    userData: userDataBytes
  })
}

defineExpose({
  transfer
})

</script>
