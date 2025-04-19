import * as constant from '../const'
import type { ApolloClientOptions } from '@apollo/client/core'
import { createHttpLink, InMemoryCache, split } from '@apollo/client/core'
// import type { BootFileParams } from '@quasar/app'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { dbBase } from 'src/controller'
import { dbModel } from 'src/model'

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

  let schema = network.rpcSchema
  let wsSchema = network.wsSchema
  let host = network.host
  let port = network.port
  let path = network.path?.length ? network?.path : undefined

  if (endpointType === EndpointType.Faucet && network) {
    const url = new URL(constant.formalizeSchema(network.faucetUrl))
    const protocol = url.protocol.replace(':', '')
    schema = protocol as dbModel.HTTPSchema
    wsSchema =
      protocol === dbModel.HTTPSchema.HTTP
        ? dbModel.WSSchema.WS
        : dbModel.WSSchema.WSS
    host = url.hostname
    port = parseInt(
      url.port ? url.port : protocol === dbModel.HTTPSchema.HTTP ? '80' : '443'
    )
    path = url.pathname
  }

  return getClientOptions(
    schema,
    wsSchema,
    host,
    port,
    path,
    chainId,
    applicationId
  )
}

export /* async */ function getClientOptions(
  schema: dbModel.HTTPSchema,
  wsSchema: dbModel.WSSchema,
  host: string,
  port: number,
  path?: string,
  chainId?: string,
  applicationId?: string
) {
  const httpBaseUrl = constant.formalizeSchema(`${schema}://${host}:${port}`)
  const wsBaseUrl = constant.formalizeSchema(`${wsSchema}://${host}:${port}/ws`)

  return getClientOptionsWithBaseUrl(
    httpBaseUrl,
    wsBaseUrl,
    chainId,
    applicationId,
    path
  )
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
