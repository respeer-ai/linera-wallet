<script setup lang='ts'>
import { watch } from 'vue'
import { dbModel } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const networks = defineModel<dbModel.Network[]>('networks')
const selectedNetwork = defineModel<dbModel.Network>('selectedNetwork')

const _networks = useObservable<dbModel.Network[]>(
  liveQuery(async () => {
    return await dbBase.networks.toArray()
  }) as never
)

watch(_networks, () => {
  selectedNetwork.value = _networks.value?.find((el) => el.selected)
  networks.value = _networks.value
})

</script>
