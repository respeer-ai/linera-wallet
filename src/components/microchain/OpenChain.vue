<template>
  <DbMicrochainBridge ref='dbMicrochainBridge' />
  <RpcMicrochainBridge ref='rpcMicrochainBridge' />
  <RpcBlockBridge ref='rpcBlockBridge' />
</template>

<script setup lang="ts">
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { localStore } from 'src/localstores'
import { dbWallet } from 'src/controller'
import { rpc } from 'src/model'
import { ref } from 'vue'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import RpcMicrochainBridge from '../bridge/rpc/MicrochainBridge.vue'
import RpcBlockBridge from '../bridge/rpc/BlockBridge.vue'

const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const rpcMicrochainBridge = ref<InstanceType<typeof RpcMicrochainBridge>>()
const rpcBlockBridge = ref<InstanceType<typeof RpcBlockBridge>>()

const openMicrochain = async () => {
  const owner = await dbWallet.owners.where('selected').equals(1).first()
  if (!owner) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const resp = await rpcMicrochainBridge.value?.openChain(owner?.address) as rpc.OpenChainResp
  if (!resp) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await dbMicrochainBridge.value?.addMicrochain(owner.owner, resp.chainId, resp.messageId, resp.certificateHash)

  const typeNameBytes = new TextEncoder().encode('Nonce::')
  const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(resp.certificateHash)])
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(owner.privateKey)))
  const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcMicrochainBridge.value?.initMicrochainChainStore(owner.address, signature, resp.chainId, resp.messageId, resp.certificateHash)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcBlockBridge.value?.signNewBlock(resp.chainId, 0, Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(localStore.wallet.currentAccount?.privateKey as string))))
  localStore.notification.pushNotification({
    Title: 'Open chain',
    Message: 'Success open microchain.',
    Popup: true,
    Type: localStore.notify.NotifyType.Info
  })
}

defineExpose({
  openMicrochain
})

</script>
