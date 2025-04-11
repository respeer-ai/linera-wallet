import { ApolloClient /*, createHttpLink */ } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { boot } from 'quasar/wrappers'

export default boot(
  /* async */ ({ app }) => {
    // Default client.

    const apolloClients: Record<string, ApolloClient<unknown>> = {
      // clientA,
      // clientB,
    }

    app.provide(ApolloClients, apolloClients)
  }
)
