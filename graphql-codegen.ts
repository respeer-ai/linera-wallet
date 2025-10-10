/* eslint-disable object-shorthand */
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './src/__generated__/graphql/service/': {
      schema: 'http://api.testnet-conway.rpc.respeer.ai/api/rpc',
      documents: ['src/graphql/service.ts'],
      preset: 'client',
      plugins: []
    },
    './src/__generated__/graphql/faucet/': {
      schema: 'https://faucet.testnet-conway.linera.net',
      documents: ['src/graphql/faucet.ts'],
      preset: 'client',
      plugins: []
    }
  }
}

export default config
