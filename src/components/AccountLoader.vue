<script setup lang='ts'>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const router = useRouter()

onMounted(() => {
  _wallet.load(() => {
    if (!_wallet.currentAddress) {
      void router.push({ path: '/' })
    }
  })
})
</script>
