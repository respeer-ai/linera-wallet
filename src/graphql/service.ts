import { gql } from '@apollo/client/core'

export const GET_ACCOUNT_BALANCE = gql`
  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {
    balance(chainId: $chainId, publicKey: $publicKey)
  }`
