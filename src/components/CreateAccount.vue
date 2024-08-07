<template>
  <div>
    <q-btn
      v-if='!autoRun'
      outline
      rounded
      label='Create Account'
      @click='onCreateAccountClick'
      class='text-brown-10'
      :style='{
        width: "100%"
      }'
    />
  </div>
  <q-dialog v-model='passwordVerifing'>
    <VerifyPassword
      title='Create Account' v-model:password='shadowPassword' @verified='onPasswordVerified' @error='onPasswordError'
      @cancel='onPasswordCancel'
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery
} from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint } from 'src/utils'
import { wallet, notify } from 'src/localstores'
import { onMounted, toRef, ref } from 'vue'

import VerifyPassword from 'src/components/VerifyPassword.vue'

interface Props {
  checkExist?: boolean
  autoRun?: boolean
  password?: string
}

const publicKey = defineModel<string>('publicKey')

const props = defineProps<Props>()
const autoRun = toRef(props, 'autoRun')
const password = toRef(props, 'password')
const shadowPassword = ref(password.value)
const checkExist = toRef(props, 'checkExist')
const passwordVerifing = ref(false)

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

const openChain = async (publicKey: string, done?: (chainId: string, messageId: string, certificateHash: string) => void) => {
  const options = getClientOptions(endpoint.faucetSchema, endpoint.faucetWsSchema, endpoint.faucetHost, endpoint.faucetPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation openChain ($publicKey: String!) {
      claim(publicKey: $publicKey) {
        messageId
        chainId
        certificateHash
      }
    }`))
  onDone((res) => {
    done?.(
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'chainId') as string,
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'messageId') as string,
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'certificateHash') as string
    )
  })
  onError((error) => {
    console.log('Fail open chain for ', publicKey, error)
  })
  await mutate({
    publicKey
  })
}

const initMicrochainChainStore = async (publicKey: string, signature: string, chainId: string, messageId: string, certificateHash: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $signature: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, $certificateHash: String!) {
      walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)
    }`))
  onDone(() => {
    done?.()
  })
  onError((error) => {
    console.log('Fail init microchain store for ', publicKey, error)
  })
  await mutate({
    publicKey,
    signature,
    faucetUrl: endpoint.faucetUrl,
    chainId,
    messageId,
    certificateHash
  })
}

const generateEd25519SigningKey = (done?: (keyPair: Ed25519SigningKey) => void) => {
  Berith.initBundledOnce()
    .then(() => {
      done?.(new Ed25519SigningKey())
    })
    .catch((reason) => {
      console.log('Rejected:', reason)
    })
}

const getPendingRawBlock = (chainId: string, done?: (blockAndRound: unknown) => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
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

  onResult((res) => {
    const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
    if (!rawBlock) {
      setTimeout(() => getPendingRawBlock(chainId, done), 1000)
      return
    }
    done?.(rawBlock)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  onDone(() => {
    done?.()
  })
  onError(() => {
    // console.log('Fail submit block signature for', chainId, error)
  })
  await mutate({
    chainId,
    height,
    signature
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey, done?: () => void) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    const payloadBytes = graphqlResult.keyValue(rawBlockAndRound, 'payloadBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (height !== notifiedHeight) {
      console.log('Mismatch block height', height, notifiedHeight)
      return
    }
    void submitBlockSignature(chainId, height, signature, () => {
      done?.()
    })
  })
}

const createAccount = () => {
  generateEd25519SigningKey((keyPair: Ed25519SigningKey) => {
    const _publicKey = _hex.toHex(keyPair.public().to_bytes().bytes)
    const privateKey = _hex.toHex(keyPair.to_bytes().bytes)
    void openChain(_publicKey, (chainId: string, messageId: string, certificateHash: string) => {
      const typeNameBytes = new TextEncoder().encode('Nonce::')
      const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(certificateHash)])
      const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
      void initMicrochainChainStore(_publicKey, signature, chainId, messageId, certificateHash, () => {
        signNewBlock(chainId, 0, keyPair, () => {
          void _wallet.addAccount(_publicKey, privateKey, shadowPassword.value as string, () => {
            _wallet.addChain(_publicKey, chainId, messageId, certificateHash, endpoint.rpcUrl)
            publicKey.value = _publicKey
            notification.pushNotification({
              Title: 'Create Account',
              Message: 'Success create new account.',
              Popup: true,
              Type: notify.NotifyType.Info
            })
          }, () => {
            console.log('Fail add account')
          })
        })
      })
    })
  })
}

const onPasswordVerified = () => {
  passwordVerifing.value = false
  createAccount()
}

const onPasswordError = () => {
  passwordVerifing.value = false
}

const onPasswordCancel = () => {
  passwordVerifing.value = false
}

const onCreateAccountClick = () => {
  passwordVerifing.value = true
}

onMounted(() => {
  if (!autoRun.value) {
    return
  }
  if (checkExist.value && _wallet.accounts.size > 0) {
    publicKey.value = Array.from(_wallet.accounts.keys())[0]
    return
  }
  createAccount()
})

</script>
