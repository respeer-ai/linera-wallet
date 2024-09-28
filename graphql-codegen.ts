import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: './wasm/linera-protocol/linera-service-graphql-client/gql/*.graphql',
  generates: {
    './dist/generated/graphql/': {
      preset: 'client'
    }
  }
}

export default config
