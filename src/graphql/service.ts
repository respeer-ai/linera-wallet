import { gql } from '@apollo/client/core'

export const GET_ACCOUNT_BALANCE = gql`
  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {
    balance(chainId: $chainId, publicKey: $publicKey)
  }`

export const GET_CHAIN_ACCOUNT_BALANCES = gql`
  query getChainAccountBalances($chainIds: [ChainId!]!, $publicKeys: [PublicKey!]!) {
    balances(chainIds: $chainIds, publicKeys: $publicKeys)
  }`

export const APPLICATIONS = gql`
  query applications($chainId: ChainId!) {
    applications(chainId: $chainId) {
      id
      link
      description
    }
  }`

export const CHAINS_WITH_PUBLIC_KEY = gql`
  query chainsWithPublicKey ($publicKey: PublicKey!) {
    chainsWithPublicKey(publicKey: $publicKey) {
      list
      default
    }
  }`
