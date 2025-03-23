/* eslint-disable object-shorthand */
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './src/__generated__/graphql/service/': {
      schema: 'http://172.16.31.73:30080',
      documents: ['src/graphql/service.ts'],
      preset: 'client',
      plugins: []
    },
    './src/__generated__/graphql/faucet/': {
      schema: 'http://172.16.31.42:8080',
      documents: ['src/graphql/faucet.ts'],
      preset: 'client',
      plugins: []
    },
    './src/__generated__/graphql/sdk/': {
      schema:
        './wasm/linera-protocol/linera-service-graphql-client/gql/*.graphql',
      documents: [],
      preset: 'client',
      plugins: []
    }
  }
}

export default config
