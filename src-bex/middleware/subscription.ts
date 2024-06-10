import { BexPayload } from '@quasar/app-vite'
import { unsafeRandomBytes } from '@metamask/eth-json-rpc-filters/hexUtils'

export type SubscriptionHandler = (payload: BexPayload<unknown, unknown>) => void

interface SubscriptionParams {
  topics: string[]
  handler: SubscriptionHandler
}

export class Subscription {
  subscribers:Map<string, SubscriptionParams>

  constructor () {
    this.subscribers = new Map<string, SubscriptionParams>()
  }

  subscribe (topics: string[], handler: SubscriptionHandler): string {
    const subscriptionId = unsafeRandomBytes(16)
    this.subscribers.set(subscriptionId, {
      topics,
      handler
    } as SubscriptionParams)
    return subscriptionId
  }

  unsubscribe (subscriptionId: string): SubscriptionHandler | undefined {
    const handler = this.subscribers.get(subscriptionId)?.handler
    this.subscribers.delete(subscriptionId)
    return handler
  }
}
