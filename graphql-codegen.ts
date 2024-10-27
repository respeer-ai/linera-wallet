/* eslint-disable object-shorthand */
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    './dist/__generated__/graphql/service/': {
      schema: 'http://172.16.31.73:30080',
      documents: ['src/graphql/service.ts'],
      preset: 'client',
      plugins: []
    },
    './dist/__generated__/graphql/faucet/': {
      schema: 'http://172.16.31.73:40080',
      documents: ['src/graphql/faucet.ts'],
      preset: 'client',
      plugins: []
    }
  }
}

export default config
