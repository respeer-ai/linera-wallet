<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { _hex } from 'src/utils'
import { localStore, operationDef } from 'src/localstores'
import { db, rpc } from 'src/model'

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number, userData?: string) => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
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
    amount: amount.toString(),
    userData: userDataBytes
  })
}

const transferV1 = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number, userData?: number[]) => {
  const fromOwner = fromPublicKey !== undefined ? await db.ownerFromPublicKey(fromPublicKey) : undefined
  const toOwner = toPublicKey !== undefined ? await db.ownerFromPublicKey(toPublicKey) : undefined

  localStore.operation.operations.push({
    microchain: fromChainId,
    operation: {
      System: {
        Transfer: {
          owner: fromOwner,
          recipient: {
            Account: {
              chain_id: toChainId,
              owner: toOwner
            }
          },
          amount: amount.toString(),
          user_data: userData || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      }
    } as rpc.Operation
  } as operationDef.ChainOperation)
}

defineExpose({
  transfer,
  transferV1
})

</script>
