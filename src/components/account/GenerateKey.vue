<script setup lang='ts'>
import { onMounted, toRef } from 'vue'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { dbWallet } from 'src/controller'
import { Ed25519 } from 'src/crypto'

interface Props {
  password?: string
}

const privateKeyHex = defineModel<string>('privateKeyHex')
const mnemonic = defineModel<string>('mnemonic')

const props = defineProps<Props>()
const password = toRef(props, 'password')

const createAccount = () => {
  if (!password.value?.length) return
  lineraWasm.generate_secret_key('').then((val) => {
    const keyObj = JSON.parse(val) as Record<string, string>
    mnemonic.value = keyObj.mnemonic
    privateKeyHex.value = keyObj.secret_key
  }).catch((error) => {
    console.log('Fail generate key pair', error)
  })
}

const createAccountWithMnemonic = async (mnemonic: string[], _password?: string) => {
  if (!_password?.length) throw new Error('Invalid password')
  return await lineraWasm.generate_secret_key_from_mnemonic(mnemonic.join(' '), '')
}

onMounted(() => {
  void createAccount()
})

const generateKey = () => {
  return Ed25519.newSecretKeyToHex()
}

const defaultAccountName = async () => {
  return 'Account ' + (await dbWallet.owners.count()).toString()
}

defineExpose({
  generateKey,
  defaultAccountName,
  createAccountWithMnemonic
})

</script>
