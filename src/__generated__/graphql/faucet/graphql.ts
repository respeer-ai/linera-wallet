/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** The unique identifier (UID) of a chain. This is currently computed as the hash value of a ChainDescription. */
  ChainId: { input: any; output: any }
  /** The version of the Linera crates used in this build */
  CrateVersion: { input: any; output: any }
  /** A Sha3-256 value */
  CryptoHash: { input: any; output: any }
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any }
  /** The index of a message in a chain */
  MessageId: { input: any; output: any }
  /** A signature public key */
  PublicKey: { input: any; output: any }
  /** The identity of a validator */
  ValidatorName: { input: any; output: any }
}

/** The result of a successful `claim` mutation. */
export type ClaimOutcome = {
  __typename?: 'ClaimOutcome'
  /** The hash of the parent chain's certificate containing the `OpenChain` operation. */
  certificateHash: Scalars['CryptoHash']['output']
  /** The ID of the new chain. */
  chainId: Scalars['ChainId']['output']
  /** The ID of the message that created the new chain. */
  messageId: Scalars['MessageId']['output']
}

export type MutationRoot = {
  __typename?: 'MutationRoot'
  /** Creates a new chain with the given authentication key, and transfers tokens to it. */
  claim: ClaimOutcome
}

export type MutationRootClaimArgs = {
  publicKey: Scalars['PublicKey']['input']
}

export type QueryRoot = {
  __typename?: 'QueryRoot'
  /** Returns the current committee's validators. */
  currentValidators: Array<Validator>
  /** Returns the genesis config. */
  genesisConfig: Scalars['JSON']['output']
  /** Returns the version information on this faucet service. */
  version: VersionInfo
}

export type Validator = {
  __typename?: 'Validator'
  name: Scalars['ValidatorName']['output']
  networkAddress: Scalars['String']['output']
}

/** The version info of a build of Linera. */
export type VersionInfo = {
  __typename?: 'VersionInfo'
  /** The crate version */
  crateVersion: Scalars['CrateVersion']['output']
  /** The git commit hash */
  gitCommit: Scalars['String']['output']
  /** Whether the git checkout was dirty */
  gitDirty: Scalars['Boolean']['output']
  /** A hash of the GraphQL API */
  graphqlHash: Scalars['String']['output']
  /** A hash of the RPC API */
  rpcHash: Scalars['String']['output']
  /** A hash of the WIT API */
  witHash: Scalars['String']['output']
}

export type OpenChainMutationVariables = Exact<{
  publicKey: Scalars['PublicKey']['input']
}>

export type OpenChainMutation = {
  __typename?: 'MutationRoot'
  claim: {
    __typename?: 'ClaimOutcome'
    messageId: any
    chainId: any
    certificateHash: any
  }
}

export const OpenChainDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'openChain' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'publicKey' }
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'PublicKey' }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'claim' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'publicKey' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'publicKey' }
                }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'messageId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'chainId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'certificateHash' }
                }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<OpenChainMutation, OpenChainMutationVariables>
