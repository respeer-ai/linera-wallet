import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import localforage from 'localforage'

export default boot(({ app }) => {
  const pinia = createPinia()

  localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'checko.respeer.ai-data',
    version: 1.0,
    storeName: 'checko',
    description: 'Local storage for CheCko wallet'
  })

  app.use(pinia)
})
