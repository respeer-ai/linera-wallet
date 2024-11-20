<script setup lang='ts'>
import { dbBase } from '../../../controller'
import { uid } from 'quasar'

const initialize = async () => {
  if ((await dbBase.deviceFingerPrint.toArray()).length > 0) return
  await dbBase.deviceFingerPrint.add({ fingerPrint: uid() })
}

defineExpose({
  initialize
})

</script>
