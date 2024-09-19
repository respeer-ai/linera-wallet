<script setup lang='ts'>
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { onMounted, toRef } from 'vue'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { dbWallet } from 'src/controller'

interface Props {
  password?: string
}

const publicKey = defineModel<string>('publicKey')
const privateKey = defineModel<string>('privateKey')
const mnemonic = defineModel<string>('mnemonic')

const props = defineProps<Props>()
const password = toRef(props, 'password')

const createAccount = () => {
  if (!password.value?.length) return
  lineraWasm.generate_key_pair(password.value).then((val) => {
    const keyObj = JSON.parse(val) as Record<string, string>
    const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(keyObj.secret_key)))

    mnemonic.value = keyObj.mnemonic
    privateKey.value = keyObj.secret_key
    publicKey.value = _hex.toHex(keyPair.public().to_bytes().bytes)
  }).catch((err) => {
    console.log('Fail generate key pair', err)
  })
}

onMounted(() => {
  void createAccount()
})

const generateKey = () => {
  return _hex.toHex((Ed25519SigningKey.random().to_bytes().bytes))
}

const defaultAccountName = async () => {
  return 'Account ' + (await dbWallet.owners.count()).toString()
}

defineExpose({
  generateKey,
  defaultAccountName
})

</script>
