<template>
  <div />
</template>
<script setup lang='ts'>
import { toRef, watch } from 'vue'
import { dbModel } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

interface Props {
  publicKey?: string
  microchain?: string
}

const props = defineProps<Props>()
const publicKey = toRef(props, 'publicKey')
const microchain = toRef(props, 'microchain')

const activities = defineModel<dbModel.Activity[]>('activities')

const _activities = useObservable<dbModel.Activity[]>(
  liveQuery(async () => {
    const acts = [] as dbModel.Activity[]
    if (publicKey.value) {
      acts.push(...await dbWallet.activities.where('targetAddress').equalsIgnoreCase(publicKey.value).toArray())
      acts.push(...await dbWallet.activities.where('sourceAddress').equalsIgnoreCase(publicKey.value).toArray())
    } else if (microchain.value) {
      acts.push(...await dbWallet.activities.where('targetChain').equalsIgnoreCase(microchain.value).toArray())
      acts.push(...await dbWallet.activities.where('sourceChain').equalsIgnoreCase(microchain.value).toArray())
    } else {
      acts.push(...await dbWallet.activities.toArray())
    }
    return acts
  }) as never
)

watch(_activities, () => {
  activities.value = _activities.value
})

</script>
