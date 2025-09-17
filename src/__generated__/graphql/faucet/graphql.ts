/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A unique identifier for a user or an application. */
  AccountOwner: { input: any; output: any; }
  /** Initial chain configuration and chain origin. */
  ChainDescription: { input: any; output: any; }
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any; }
  /** A scalar that can represent any JSON Object value. */
  JSONObject: { input: any; output: any; }
  /** A collection of prices and limits associated with block execution */
  ResourceControlPolicyScalar: { input: any; output: any; }
  /** A secp256k1 public key value */
  Secp256k1PublicKey: { input: any; output: any; }
  VersionInfo: { input: any; output: any; }
};

export type Committee = {
  __typename?: 'Committee';
  policy: Scalars['ResourceControlPolicyScalar']['output'];
  quorumThreshold: Scalars['Int']['output'];
  totalVotes: Scalars['Int']['output'];
  validators: Scalars['JSONObject']['output'];
  validityThreshold: Scalars['Int']['output'];
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  /** Creates a new chain with the given authentication key, and transfers tokens to it. */
  claim: Scalars['ChainDescription']['output'];
};


export type MutationRootClaimArgs = {
  owner: Scalars['AccountOwner']['input'];
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  /** Returns the current committee, including weights and resource policy. */
  currentCommittee: Committee;
  /** Returns the current committee's validators. */
  currentValidators: Array<Validator>;
  /** Returns the genesis config. */
  genesisConfig: Scalars['JSON']['output'];
  /** Returns the version information on this faucet service. */
  version: Scalars['VersionInfo']['output'];
};

export type Validator = {
  __typename?: 'Validator';
  networkAddress: Scalars['String']['output'];
  publicKey: Scalars['Secp256k1PublicKey']['output'];
};

export type OpenChainMutationVariables = Exact<{
  owner: Scalars['AccountOwner']['input'];
}>;


export type OpenChainMutation = { __typename?: 'MutationRoot', claim: any };

export type NetworkInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type NetworkInfoQuery = { __typename?: 'QueryRoot', genesisConfig: any, version: any, currentValidators: Array<{ __typename?: 'Validator', publicKey: any, networkAddress: string }> };


export const OpenChainDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"openChain"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOwner"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"claim"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}}]}]}}]} as unknown as DocumentNode<OpenChainMutation, OpenChainMutationVariables>;
export const NetworkInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"networkInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"genesisConfig"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"currentValidators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicKey"}},{"kind":"Field","name":{"kind":"Name","value":"networkAddress"}}]}}]}}]} as unknown as DocumentNode<NetworkInfoQuery, NetworkInfoQueryVariables>;