/* eslint-disable object-shorthand */
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './src/__generated__/graphql/service/': {
      schema: 'http://api.rpc.respeer.ai/api/rpc',
      documents: ['src/graphql/service.ts'],
      preset: 'client',
      plugins: []
    },
    './src/__generated__/graphql/faucet/': {
      schema: 'http://api.faucet.respeer.ai/api/faucet',
      documents: ['src/graphql/faucet.ts'],
      preset: 'client',
      plugins: []
    }
  }
}

export default config
