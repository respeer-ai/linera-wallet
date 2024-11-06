import type { ApolloClientOptions } from '@apollo/client/core'
import { createHttpLink, InMemoryCache, split } from '@apollo/client/core'
// import type { BootFileParams } from '@quasar/app'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { dbBase } from 'src/controller'
import { db } from 'src/model'

export enum EndpointType {
  Faucet,
  Rpc,
  Application
}

export async function getClientOptionsWithEndpointType(
  endpointType: EndpointType,
  chainId?: string,
  applicationId?: string
) {
  const network = (await dbBase.networks.toArray()).find((el) => el.selected)

  let schema = network?.rpcSchema
  let wsSchema = network?.wsSchema
  let host = network?.host
  let port = network?.port

  if (endpointType === EndpointType.Faucet && network) {
    const url = new URL(network.faucetUrl)
    const protocol = url.protocol.replace(':', '')
    schema = protocol as db.HTTPSchema
    wsSchema =
      protocol === db.HTTPSchema.HTTP ? db.WSSchema.WS : db.WSSchema.WSS
    host = url.hostname
    port = parseInt(url.port)
  }

  return getClientOptions(schema, wsSchema, host, port, chainId, applicationId)
}

export /* async */ function getClientOptions(
  schema?: string,
  wsSchema?: string,
  host?: string,
  port?: number,
  chainId?: string,
  applicationId?: string
) {
  const schema1 = schema || 'https'
  const port1 = port?.toString() || '8080'
  const host1 = host || 'localhost'
  const wsSchema1 = wsSchema || 'ws'

  const httpBaseUrl = schema1 + '://' + host1 + ':' + port1 + (chainId ? `/chains/${chainId}` : '') + (applicationId ? `/applications/${applicationId}` : '')
  const wsBaseUrl = wsSchema1 + '://' + host1 + ':' + port1 + '/ws'

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsBaseUrl
    })
  )

  const httpLink = createHttpLink({
    uri: () => {
      return httpBaseUrl
    }
  })

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  )

  return <ApolloClientOptions<unknown>>Object.assign(
    // General options.
    <ApolloClientOptions<unknown>>{
      link: splitLink,
      cache: new InMemoryCache()
    },

    // Specific Quasar mode options.
    process.env.MODE === 'spa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'ssr'
      ? {
          //
        }
      : {},
    process.env.MODE === 'pwa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'bex'
      ? {
          //
        }
      : {},
    process.env.MODE === 'cordova'
      ? {
          //
        }
      : {},
    process.env.MODE === 'capacitor'
      ? {
          //
        }
      : {},
    process.env.MODE === 'electron'
      ? {
          //
        }
      : {},

    // dev/prod options.
    process.env.DEV
      ? {
          //
        }
      : {},
    process.env.PROD
      ? {
          //
        }
      : {},

    // For ssr mode, when on server.
    process.env.MODE === 'ssr' && process.env.SERVER
      ? {
          ssrMode: true
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === 'ssr' && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100
        }
      : {}
  )
}
