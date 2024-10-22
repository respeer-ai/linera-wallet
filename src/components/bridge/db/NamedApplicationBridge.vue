<script setup lang='ts'>
import { onMounted, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { localStore } from '../../../localstores'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const namedApplications = defineModel<db.NamedApplication[]>('namedApplications')

const _namedApplications = useObservable<db.NamedApplication[]>(
  liveQuery(async () => {
    return await dbWallet.namedApplications.toArray()
  }) as never
)

watch(_namedApplications, () => {
  namedApplications.value = _namedApplications.value
})

onMounted(async () => {
  if (localStore.setting.creatingDefaultNamedApplication) {
    return
  }
  localStore.setting.CreatingDefaultNamedApplication = true
  if (!await dbWallet.namedApplications.count()) {
    for (const namedApplication of db.defaultNamedApplications) {
      await dbWallet.namedApplications.add(namedApplication)
    }
  }
})

const createNamedApplication = async (namedApplication: db.NamedApplication) => {
  await dbWallet.namedApplications.add(namedApplication)
}

const updateNamedApplication = async (namedApplication: db.NamedApplication) => {
  await dbWallet.namedApplications.update(namedApplication.id, namedApplication)
}

const deleteNamedApplication = async (id: number) => {
  await dbWallet.namedApplications.delete(id)
}

defineExpose({
  createNamedApplication,
  deleteNamedApplication,
  updateNamedApplication
})

</script>
