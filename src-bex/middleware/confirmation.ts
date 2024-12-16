import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
import {
  PopupRequestType,
  RpcRequest,
  RpcMethod,
  lineraGraphqlMutationOperation,
  lineraGraphqlQueryApplicationId
} from './types'
import { commontypes } from '../../src/types'
import { BexPayload } from '@quasar/app-vite'
import { sharedStore } from '../store'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true],
  [RpcMethod.CHECKO_PING, false],
  [RpcMethod.LINERA_GRAPHQL_MUTATION, true],
  [RpcMethod.LINERA_GRAPHQL_PUBLISH_DATA_BLOB, true],
  [RpcMethod.LINERA_GRAPHQL_QUERY, false],
  [RpcMethod.LINERA_SUBSCRIBE, false],
  [RpcMethod.LINERA_UNSUBSCRIBE, false],
  [RpcMethod.ETH_GET_BALANCE, false],
  [RpcMethod.ETH_SIGN, true],

  [RpcMethod.SEND_METADATA, false]
])

export const needConfirm = async (req: RpcRequest) => {
  let shouldConfirm = confirmations.get(req.request.method as RpcMethod)
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  if (shouldConfirm) {
    shouldConfirm = !(await sharedStore.authenticated(
      req.origin,
      req.request.method as RpcMethod,
      req.request.method === RpcMethod.LINERA_GRAPHQL_MUTATION
        ? lineraGraphqlQueryApplicationId(req)
        : undefined,
      (req.request.method === RpcMethod.LINERA_GRAPHQL_MUTATION || req.request.method === RpcMethod.LINERA_GRAPHQL_PUBLISH_DATA_BLOB)
        ? lineraGraphqlMutationOperation(req)
        : undefined
    ))
  }
  if (shouldConfirm === undefined) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Request ${JSON.stringify(req)} is not in the confirmations`)
    return Promise.reject('Not implemented')
  }
  // TODO: check with origin and publicKey
  return (
    shouldConfirm === undefined ||
    shouldConfirm ||
    req.request.method === RpcMethod.ETH_SIGN
  )
}

// TODO: DelayMs is workaround for the first message of bridge
const confirmationWithExistPopup = (
  req: RpcRequest,
  resolve: (message: string | undefined) => void,
  reject: (err: Error) => void,
  delayMs: number
) => {
  setTimeout(() => {
    basebridge.EventBus.bridge
      ?.send('popup.new', {
        type: PopupRequestType.CONFIRMATION,
        request: req
      })
      .then((payload: BexPayload<commontypes.PopupResponse, unknown>) => {
        if (payload.data.code !== 0) {
          return reject(new Error(payload.data.message))
        }
        resolve(payload.data.message)
      })
      .catch((e: Error) => {
        reject(e)
      })
  }, delayMs)
}

export const confirmationHandler = async (
  req: RpcRequest
): Promise<string | undefined> => {
  if (!(await needConfirm(req))) {
    req.silent = true
    return await Promise.resolve(undefined)
  }

  return new Promise<string | undefined>((resolve, reject) => {
    const requestId = Number(req.request.id)
    let responded = false

    notificationManager
      .showPopup(requestId, (_requestId: number) => {
        if (responded) {
          return
        }
        if (requestId === _requestId) {
          return reject(new Error('Rejected by user'))
        }
      })
      .then((newWindowId?: number) => {
        confirmationWithExistPopup(
          req,
          (message: string | undefined) => {
            resolve(message)
            responded = true
          },
          (e: Error) => {
            reject(e)
            responded = true
          },
          newWindowId !== undefined ? 1000 : 0
        )
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
