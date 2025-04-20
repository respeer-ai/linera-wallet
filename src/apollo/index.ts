import type { ApolloClientOptions } from '@apollo/client/core'
import { createHttpLink, InMemoryCache, split } from '@apollo/client/core'
// import type { BootFileParams } from '@quasar/app'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { dbBase } from 'src/controller'

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
  if (!network) return

  let rpcUrl = network.rpcUrl
  const rpcWsUrl = network.rpcWsUrl

  if (endpointType === EndpointType.Faucet && network) {
    rpcUrl = network.faucetUrl
  }

  return getClientOptionsWithBaseUrl(rpcUrl, rpcWsUrl, chainId, applicationId)
}

export function getClientOptionsWithBaseUrl(
  baseUrl: string,
  wsBaseUrl: string,
  chainId?: string,
  applicationId?: string,
  path?: string
) {
  const httpBaseUrl = baseUrl
  const path1 = path || ''

  const httpApiBaseUrl =
    httpBaseUrl +
    path1 +
    (chainId ? `/chains/${chainId}` : '') +
    (applicationId ? `/applications/${applicationId}` : '')

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsBaseUrl
    })
  )

  const httpLink = createHttpLink({
    uri: () => {
      return httpApiBaseUrl
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
