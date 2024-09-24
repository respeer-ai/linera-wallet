<template>
  <div v-if='displayAddresses.length && display'>
    <div class='row'>
      <q-icon
        v-if='showLogo'
        :name='"img:" + lineraLogo'
        size='24px'
        :style='{ margin: "12px" }'
      />
      <q-select
        dense
        v-model='selectedAddress'
        :label='label'
        :options='displayAddresses'
        :style='{ height: "24px" }'
      />
      <q-icon
        name='content_copy'
        size='16px'
        color='grey'
        :style='{
          margin: "16px 8px",
        }'
        class='cursor-pointer'
        @click='onCopyAddressClick'
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { wallet, notify } from 'src/localstores'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery,
  useSubscription
} from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint, shortid } from 'src/utils'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { copyToClipboard } from 'quasar'
import wasmModuleUrl from '../../src-bex/wasm/linera_wasm_bg.wasm?url'
import initWasm from '../../src-bex/wasm/linera_wasm'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'

import lineraLogo from '../assets/LineraLogo.png'

interface Props {
  showLogo?: boolean
  showDigits?: number
  label?: string
  display?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  showDigits: undefined,
  label: undefined,
  display: true
})
const showLogo = toRef(props, 'showLogo')
const showDigits = toRef(props, 'showDigits')
const label = toRef(props, 'label')
const display = toRef(props, 'display')

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)

interface SelectAddress {
  label: string
  value: string
  originValue: string
}

const displayAddresses = computed(() => addresses.value.map(el => {
  return {
    label: showDigits.value ? shortid.shortId(_wallet.displayAddress(el), showDigits.value) : _wallet.displayAddress(el),
    originValue: el,
    value: showDigits.value ? shortid.shortId(el, showDigits.value) : el
  } as SelectAddress
}))

const addressCount = computed(() => displayAddresses.value.length)
const currentAddress = computed(() => _wallet.currentAddress)
const selectedAddress = ref(displayAddresses.value.find((el) => el.originValue === currentAddress.value) ||
                            displayAddresses.value.find((el) => el) ||
                            undefined as unknown as SelectAddress)
const address = computed(() => selectedAddress.value?.originValue)
const chains = computed(() => _wallet.chains)
const subscriptions = ref(new Map<string, Array<string>>())

const notification = notify.useNotificationStore()

const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
const apolloClient = new ApolloClient(options)

const subscribe = (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: (hash: string) => void, onNewIncomingBundle?: () => void) => {
  const { /* result, refetch, fetchMore, */ onResult /*, onError */ } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription notifications($chainId: String!) {
      notifications(chainId: $chainId)
    }
  `, {
    chainId
  }))

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
    console.log('-------- reason: ', reason)
    const newIncomingBundle = graphqlResult.keyValue(reason, 'NewIncomingBundle')
    if (newIncomingBundle) {
      onNewIncomingBundle?.()
    }
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number | undefined, keyPair: Ed25519SigningKey, recursive?: boolean, done?: () => void) => {
  getPendingRawBlock(chainId, (rawBlockPayload: unknown) => {
    if (!rawBlockPayload) {
      done?.()
      return
    }
    const payloadBytes = graphqlResult.keyValue(rawBlockPayload, 'payloadBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockPayload, 'height') as number
    if (notifiedHeight !== undefined && height !== notifiedHeight) {
      return
    }
    void submitBlockSignature(chainId, height, signature, () => {
      if (recursive) signNewBlock(chainId, undefined, keyPair, recursive, done)
    })
  })
}

const getPendingRawBlock = (chainId: string, done?: (rawBlockPayload: unknown) => void) => {
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
    try {
      const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
      done?.(rawBlock)
    } catch (e) {
      console.log('Fail process pending raw block', e)
    }
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string, done?: () => void) => {
  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  onDone(() => {
    console.log('Success submit block signature for', chainId)
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

const getAccountBalance = (chainId: string, publicKey?: string, done?: (balance: number) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getAccountBalance($chainId: String!, $publicKey: String) {
      balance(chainId: $chainId, publicKey: $publicKey)
    }
  `, {
    chainId,
    publicKey
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    done?.(graphqlResult.data(res, 'balance') as number)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

interface ChainAccountBalances {
  chain_balance: number
  account_balances: Record<string, number>
}

const getChainAccountBalances = (done: (balances: Record<string, ChainAccountBalances>) => void) => {
  const chainIds = _wallet.chainIds
  const publicKeys = _wallet.publicKeys

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getChainAccountBalances($chainIds: [String!]!, $publicKeys: [String!]!) {
      balances(chainIds: $chainIds, publicKeys: $publicKeys)
    }
  `, {
    chainIds,
    publicKeys
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    done?.(graphqlResult.data(res, 'balances') as Record<string, ChainAccountBalances>)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const _getChainAccountBalances = () => {
  getChainAccountBalances((balances: Record<string, ChainAccountBalances>) => {
    Object.keys(balances).forEach((chainId: string) => {
      const chainBalance = balances[chainId]
      Object.keys(chainBalance?.account_balances).forEach((publicKey: string) => {
        const balance = chainBalance?.account_balances[publicKey]
        try {
          _wallet.setChainBalance(publicKey, chainId, chainBalance.chain_balance)
          _wallet.setAccountBalance(publicKey, chainId, balance)
        } catch (e) {
          // console.log('Fail get chain account balances', e)
        }
      })
    })
  })
}

const getBlockWithHash = (chainId: string, hash: string, done?: (height: number, incomingBundles: Array<graphqlResult.IncomingBundle>) => void) => {
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
                event
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
              oracleResponses {
                responses
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

  onResult((res) => {
    const block = graphqlResult.data(res, 'block')
    const value = graphqlResult.keyValue(block, 'value')
    const executedBlock = graphqlResult.keyValue(value, 'executedBlock')
    const _block = graphqlResult.keyValue(executedBlock, 'block')
    const incomingBundles = graphqlResult.keyValue(_block, 'incomingBundles') as Array<graphqlResult.IncomingBundle>
    const height = graphqlResult.keyValue(_block, 'height') as number
    done?.(height, incomingBundles)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const _getBlockWithHash = (chainId: string, hash: string) => {
  getBlockWithHash(chainId, hash, (height: number, incomingBundles: Array<graphqlResult.IncomingBundle>) => {
    try {
      incomingBundles.forEach((incomingBundle: graphqlResult.IncomingBundle) => {
        if (!incomingBundle.event?.message?.System?.Credit) return
        _wallet.publicKeyFromOwner(incomingBundle.event?.message?.System?.Credit?.source, (fromPublicKey: string | undefined) => {
          _wallet.publicKeyFromOwner(incomingBundle.event?.message?.System?.Credit?.target, (toPublicKey: string | undefined) => {
            _wallet.addActivity(
              incomingBundle.origin.sender,
              fromPublicKey,
              chainId,
              toPublicKey,
              incomingBundle.event?.message?.System?.Credit?.amount,
              height,
              incomingBundle.event?.timestamp,
              incomingBundle.event?.certificate_hash,
              incomingBundle.event?.grant
            )
          })
        })
      })
    } catch (e) {
      console.log('Fail process block', e, hash)
    }
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
    faucetUrl: endpoint.faucetLocalUrl,
    chainId,
    messageId,
    certificateHash
  })
}

const getPendingMessages = (chainId: string, done?: (messages: Array<graphqlResult.IncomingBundle>) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingMessages($chainId: String!) {
      pendingMessages(chainId: $chainId) {
        action
        origin
        bundle
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log('Get pending messages: ', res)
    done?.(graphqlResult.data(res, 'pendingMessages') as Array<graphqlResult.IncomingBundle>)
  })

  onError((error) => {
    console.log('Get pending messages', error)
  })
}

const getChainInfos = (chainId: string, done?: (nextBlockHeight: number, blockHash: string, adminId: string, timestamp: number) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query chain($chainId: String!) {
      chain(chainId: $chainId) {
        chainId
        executionState {
          system {
            description
            epoch
            adminId
            subscriptions {
              chainId
              name
            }
            ownership
            balance
            timestamp
          }
        }
        executionStateHash
        tipState {
          blockHash
          nextBlockHeight
        }
        manager
        confirmedLog {
          entries
        }
        receivedLog {
          entries {
            chainId
            height
          }
        }
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log('Get chain messages: ', res)
    const chain = graphqlResult.data(res, 'chain')
    const tipState = graphqlResult.keyValue(chain, 'tipState')
    const nextBlockHeight = graphqlResult.keyValue(tipState, 'nextBlockHeight') as number
    const blockHash = graphqlResult.keyValue(tipState, 'blockHash') as string
    const executionState = graphqlResult.keyValue(chain, 'executionState')
    const system = graphqlResult.keyValue(executionState, 'system')
    const adminId = graphqlResult.keyValue(system, 'adminId') as string
    const timestamp = graphqlResult.keyValue(system, 'timestamp') as number
    done?.(nextBlockHeight, blockHash, adminId, timestamp)
  })

  onError((error) => {
    console.log('Get chain messages', error)
  })
}

const constructSetWallet = (state: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  fetch(wasmModuleUrl).then((buffer) => {
    initWasm(buffer).then(() => {
      console.log('set dev wallet')
      console.log('set state: ', state)
      const wallet = '{"chains":{"1db1936dad0717597a7743a8353c9c0191c14c3a129b258e9743aec2b4f05d03":{"chain_id":"1db1936dad0717597a7743a8353c9c0191c14c3a129b258e9743aec2b4f05d03","key_pair":null,"block_hash":null,"timestamp":1725413452996529,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"256e1dbc00482ddd619c293cc0df94d366afe7980022bb22d99e33036fd465dd":{"chain_id":"256e1dbc00482ddd619c293cc0df94d366afe7980022bb22d99e33036fd465dd","key_pair":"712603f0eb50793fd43181a6cb249cc8e7f648c929ab0907f29bbc180fdaf3c7ca7da3cf5c7e150f3e673551c21e8b071dbc7c681bc3f2a51ccf341651238849","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"36137b1ddac30eb9d0d4821a1560e66795dbdad6dbf4b708a8d81ca3df866e1b":{"chain_id":"36137b1ddac30eb9d0d4821a1560e66795dbdad6dbf4b708a8d81ca3df866e1b","key_pair":null,"block_hash":null,"timestamp":1725413453530077,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"434021b6e50e9ee255c40a66e65ba6ac41d8aacde231a263243d123714dbf67f":{"chain_id":"434021b6e50e9ee255c40a66e65ba6ac41d8aacde231a263243d123714dbf67f","key_pair":"ecac842b16b187cf11cba5ae3737d9d84b991cf422512eba70507b3a29c188bca5f82d50e46b685536a8fcbf859c835965ea7d746582ffd7250f8f17e4e06bd9","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"59ca93bbbf08be7d469596847511a4d066a2c9298ce29624357baa198cc23a0b":{"chain_id":"59ca93bbbf08be7d469596847511a4d066a2c9298ce29624357baa198cc23a0b","key_pair":"f47b0377d800489a5f31b81727621c6d75c4a125387fd17fb844ad7d3995b7ef091daa2f91c78e7cd3f91f6c0ab8b97b66fbf7d8dd7497e16259b7d9556810e9","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"673ce04da4b8ed773ee7cd5828a2083775bea4130498b847c5b34b2ed913b07f":{"chain_id":"673ce04da4b8ed773ee7cd5828a2083775bea4130498b847c5b34b2ed913b07f","key_pair":"93773f2611784e955f625105b8933c10ccb0bf23206e80f74c5e7577c6954e80917a91edf8602b13ec88fb7c04c34e032c10df931542c064645aa9061e23a4ac","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"69705f85ac4c9fef6c02b4d83426aaaf05154c645ec1c61665f8e450f0468bc0":{"chain_id":"69705f85ac4c9fef6c02b4d83426aaaf05154c645ec1c61665f8e450f0468bc0","key_pair":"791a37f0d230e90888c00c64c83215c67e5d8fdbcdbe1e99cc98ef85775c0051f1ef4cfb0fe3517f7854f8b3cb4036e39a9540475a1591a2a61b8bebfdf5fd0b","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"82c880daad4d0c3a6acfa0c29a79f4dafc53ce8e4624156b0f6164f3d3cb9d04":{"chain_id":"82c880daad4d0c3a6acfa0c29a79f4dafc53ce8e4624156b0f6164f3d3cb9d04","key_pair":"fcd3f3c993fcd970e599af72ad6a65cbb8890c7131660c9139dce26e9a385832a32f90464b1846ca87b0867928e2effd1b4768b349b51dd9f30ec02510ea9b06","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"af5ce56be024e99c2db8cde475b75ff1ddd8e7aa4dc95ae5db1061ed652e264a":{"chain_id":"af5ce56be024e99c2db8cde475b75ff1ddd8e7aa4dc95ae5db1061ed652e264a","key_pair":"f512d210f35c958b08abebc6c1596cd5e12964b74b8d4ab2e7269874a6fb103df760f6c166b0bed0d801b8681bb40dad78f794af51cde87346b05642efec2f86","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"be20093606a7296fbda537060becfecc62b5441fa784b3d26d6742152a80a1f9":{"chain_id":"be20093606a7296fbda537060becfecc62b5441fa784b3d26d6742152a80a1f9","key_pair":null,"block_hash":null,"timestamp":1725413453785624,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"dad01517c7a3c428ea903253a9e59964e8db06d323a9bd3f4c74d6366832bdbf":{"chain_id":"dad01517c7a3c428ea903253a9e59964e8db06d323a9bd3f4c74d6366832bdbf","key_pair":"edacc30eb072011e7eb0ff24ab71b1449f706379acb66987030b035efdf4378ab9261a9c5776cf34974af545f1a0119f1b50cf83b505afddd7c56323e77bddf9","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65":{"chain_id":"e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65","key_pair":"bf9109c12cbbaa3fc57a3d529a4f68eee5b9bc5997e31f39a803711de02e3e7c4aebf3ab685ef21e883d196db59fcec23c6076e8a75df25bd69c3d2be4f1e5fb","block_hash":"4400a534eafc375a47241db36f49ab0c3b51dc379c7809ba5ee755f9dfd8a631","timestamp":1725434011540298,"next_block_height":12,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"e54bdb17d41d5dbe16418f96b70e44546ccd63e6f3733ae3c192043548998ff3":{"chain_id":"e54bdb17d41d5dbe16418f96b70e44546ccd63e6f3733ae3c192043548998ff3","key_pair":"790765595ec7c7f5eb5cd74ea2fc4c7feef9b3de778a9838308a229ce6260aeeda2c435c4069751f5f3c8bfd5d51ba6ea7866f48e5ef7802721ae9b6bddb8424","block_hash":null,"timestamp":1725413451420684,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]},"fc9384defb0bcd8f6e206ffda32599e24ba715f45ec88d4ac81ec47eb84fa111":{"chain_id":"fc9384defb0bcd8f6e206ffda32599e24ba715f45ec88d4ac81ec47eb84fa111","key_pair":null,"block_hash":null,"timestamp":1725413453260022,"next_block_height":0,"pending_block":null,"pending_blobs":{},"pending_raw_block":null,"pending_operations":[]}},"unassigned_key_pairs":{},"default":"e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65","genesis_config":{"committee":{"validators":[{"name":"c6eb4def23f489e52855c9f77226cfdb2c20e0ea7b4faa24e050642e7712fe7c","network":{"protocol":{"Grpc":"ClearText"},"host":"127.0.0.1","port":9000}}]},"admin_id":"e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65","timestamp":1725413451420684,"chains":[["4aebf3ab685ef21e883d196db59fcec23c6076e8a75df25bd69c3d2be4f1e5fb","1000000."],["917a91edf8602b13ec88fb7c04c34e032c10df931542c064645aa9061e23a4ac","1000000."],["f1ef4cfb0fe3517f7854f8b3cb4036e39a9540475a1591a2a61b8bebfdf5fd0b","1000000."],["da2c435c4069751f5f3c8bfd5d51ba6ea7866f48e5ef7802721ae9b6bddb8424","1000000."],["f760f6c166b0bed0d801b8681bb40dad78f794af51cde87346b05642efec2f86","1000000."],["091daa2f91c78e7cd3f91f6c0ab8b97b66fbf7d8dd7497e16259b7d9556810e9","1000000."],["a5f82d50e46b685536a8fcbf859c835965ea7d746582ffd7250f8f17e4e06bd9","1000000."],["a32f90464b1846ca87b0867928e2effd1b4768b349b51dd9f30ec02510ea9b06","1000000."],["b9261a9c5776cf34974af545f1a0119f1b50cf83b505afddd7c56323e77bddf9","1000000."],["ca7da3cf5c7e150f3e673551c21e8b071dbc7c681bc3f2a51ccf341651238849","1000000."]],"policy":{"block":"0.","fuel_unit":"0.","read_operation":"0.","write_operation":"0.","byte_read":"0.","byte_written":"0.","byte_stored":"0.","operation":"0.","operation_byte":"0.","message":"0.","message_byte":"0.","maximum_bytes_read_per_block":18446744073709551615,"maximum_bytes_written_per_block":18446744073709551615},"network_name":"linera-2024-09-04T01:30:51"},"testing_prng_seed":null}'
      console.log('set wallet: ', wallet)
      // lineraWasm.set_wallet(wallet).then(() => {
      //   console.log('set successful')
      // }).catch((error) => {
      //   console.log('set_dev_wallet error: ', error)
      // })
    }).catch(() => {
      // TODO
    })
  }).catch(() => {
    // TODO
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const constructNewBlockWithIncomingBundles = (chainId: string, keyPair: Ed25519SigningKey) => {
  getChainInfos(chainId, (nextBlockHeight: number, blockHash: string, adminId: string, timestamp: number) => {
    console.log('---nextBlockHeight: ', nextBlockHeight)
    console.log('---blockHash: ', blockHash)
    console.log('---adminId: ', adminId)
    console.log('---timestamp: ', timestamp)
    console.log('---keyPair: ', keyPair)
    console.log('---keyPair str: ', JSON.stringify(keyPair))
    getPendingMessages(chainId, (messages: Array<graphqlResult.IncomingBundle>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      fetch(wasmModuleUrl).then((buffer) => {
        initWasm(buffer).then(() => {
          // console.log('set dev wallet')
          // lineraWasm.set_dev_wallet(1).then(() => {
          //   console.log('successful')
          // }).catch((error) => {
          //   console.log('set_dev_wallet error: ', error)
          // })
          console.log('Signing', chainId, messages)
          // lineraWasm.execute_operation_with_messages(chainId, '', JSON.stringify(messages)).then((signedMsg) => {
          //   console.log(signedMsg)
          // }).catch((error) => {
          //   console.log('execute_operation_with_messages', error)
          // })
          console.log('---_wallet.publicKeys[0]: ', _wallet.publicKeys[0])
          lineraWasm.execute_operation_with_messages_no_storage(chainId, '', JSON.stringify(messages), _wallet.publicKeys[0], nextBlockHeight.toString(), blockHash, adminId, timestamp.toString()).then((signedMsg) => {
            console.log(signedMsg)
          }).catch((error) => {
            console.log('execute_operation_with_messages', error)
          })
        }).catch(() => {
          // TODO
        })
      }).catch(() => {
        // TODO
      })
    })
  })
}

const processChains = () => {
  console.log('----- processChains')
  addresses.value.forEach((addr) => {
    const chains = _wallet.accountChains(addr)
    const account = _wallet.account(addr)
    console.log('----- chains: ', chains)
    console.log('----- account: ', account)
    console.log('----- _wallet.publicKeys: ', _wallet.publicKeys)
    if (!account) {
      return
    }
    let subscribedChains = subscriptions.value.get(addr)
    console.log('----- subscribedChains: ', subscribedChains)
    if (!subscribedChains) {
      subscribedChains = []
    }
    chains.forEach((microchain, chainId) => {
      if (subscribedChains?.includes(chainId)) return
      subscribedChains?.push(chainId)
      subscriptions.value.set(addr, subscribedChains as [])
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
      const typeNameBytes = new TextEncoder().encode('Nonce::')
      const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(microchain.certificate_hash)])
      const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
      console.log('----- account.privateKey: ', account.privateKey)
      console.log('----- keyPair: ', keyPair)
      console.log('----- typeNameBytes: ', typeNameBytes)
      console.log('----- bytes: ', bytes)
      console.log('----- signature: ', signature)
      void initMicrochainChainStore(addr, signature, chainId, microchain.message_id, microchain.certificate_hash, () => {
        const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
        console.log('----- keyPair: ', keyPair)
        signNewBlock(chainId, undefined, keyPair, true, () => {
          console.log('exec signNewBlock')
          _getChainAccountBalances()
        })
        subscribe(chainId, (height: number) => {
          console.log('exec subscribe')
          // We must reinitialize key here due to the last one may be disposed
          const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
          signNewBlock(chainId, height, keyPair, false)
        }, (hash: string) => {
          console.log('to exec _getChainAccountBalances')
          _getChainAccountBalances()
          console.log('to exec _getBlockWithHash')
          _getBlockWithHash(chainId, hash)
        }, () => {
          console.log('Final Set wallet', chainId)
          console.log('--_wallet: ', _wallet)
          const state = JSON.stringify(_wallet.$state)
          console.log('------ wallet state json: ', state)
          constructSetWallet(state)
          const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
          console.log('----- chainId: ', chainId)
          console.log('----- exec constructNewBlockWithIncomingBundles')
          constructNewBlockWithIncomingBundles(chainId, keyPair)
        })
        getAccountBalance(chainId, addr, (balance: number) => {
          console.log('exec getAccountBalance')
          console.log('to exec setAccountBalance')
          _wallet.setAccountBalance(addr, chainId, balance)
        })
        getAccountBalance(chainId, undefined, (balance: number) => {
          console.log('exec getAccountBalance')
          console.log('to exec setChainBalance')
          _wallet.setChainBalance(addr, chainId, balance)
        })
      })
    })
  })
}

const _processChains = () => {
  Berith.initBundledOnce()
    .then(() => {
      processChains()
    })
    .catch((reason) => {
      console.log('Rejected:', reason)
    })
}

watch(chains, () => {
  _processChains()
})

watch([addressCount, currentAddress], () => {
  if (selectedAddress.value) return
  selectedAddress.value = displayAddresses.value.find((el) => el.originValue === currentAddress.value) ||
                          displayAddresses.value.find((el) => el) ||
                          undefined as unknown as SelectAddress
})

watch(address, () => {
  if (!address.value || address.value === currentAddress.value) return
  _wallet.selectAddress(address.value)
})

onMounted(() => {
  _processChains()
  if (!currentAddress.value && selectedAddress.value) {
    _wallet.selectAddress(selectedAddress.value.originValue)
  }
})

const onCopyAddressClick = () => {
  if (!address.value) return
  copyToClipboard(address.value)
    .then(() => {
      notification.pushNotification({
        Title: 'Copy Address',
        Message: `Success copy address ${address.value} to clipboard.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy address', e)
    })
}
</script>
<style scoped lang="sass">
</style>
