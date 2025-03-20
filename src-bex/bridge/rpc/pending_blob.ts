import { PREPARE_BLOB } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { type PrepareBlobMutation } from 'src/__generated__/graphql/service/graphql'
import { sharedStore } from 'app/src-bex/store'
import axios from 'axios'
import { parse, stringify } from 'lossless-json'

export class PendingBlob {
  static addPendingBlob = async (
    chainId: string,
    bytes: Uint8Array
  ): Promise<string> => {
    const rpcUrl = await sharedStore.getRpcEndpoint()
    return new Promise((resolve, reject) => {
      axios
        .post(
          rpcUrl,
          {
            query: PREPARE_BLOB.loc?.source.body,
            variables: {
              chainId,
              bytes
            },
            operationName: 'prepareBlob'
          },
          {
            responseType: 'text',
            transformResponse: [(data) => data as string]
          }
        )
        .then((res) => {
          const dataString = graphqlResult.rootData(res) as string
          const data = parse(dataString)
          const errors = (data as Record<string, unknown[]>).errors
          if (errors && errors.length > 0) {
            return reject(stringify(errors))
          }
          const prepareBlob = (
            data as Record<string, PrepareBlobMutation>
          ).data
          resolve(prepareBlob.prepareBlob as string)
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed query block material: ${e}`)
          reject(e)
        })
    })
  }
}
