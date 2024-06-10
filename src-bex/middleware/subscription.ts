import { BexPayload } from '@quasar/app-vite'
import { unsafeRandomBytes } from '@metamask/eth-json-rpc-filters/hexUtils'

export type SubscriptionHandler = (payload: BexPayload<unknown, unknown>) => void

interface SubscriptionParams {
  topics: string[]
  handler: SubscriptionHandler
}

export class Subscription {
  subscribers: Map<string, Map<string, SubscriptionParams>>

  constructor () {
    this.subscribers = new Map<string, Map<string, SubscriptionParams>>()
  }

  subscribe (origin: string, topics: string[], handler: SubscriptionHandler): string {
    let subscribers = this.subscribers.get(origin)
    if (!subscribers) {
      subscribers = new Map<string, SubscriptionParams>()
    }
    const subscriptionId = unsafeRandomBytes(16)
    subscribers.set(subscriptionId, {
      topics,
      handler
    } as SubscriptionParams)
    this.subscribers.set(origin, subscribers)
    return subscriptionId
  }

  unsubscribe (subscriptionId: string): SubscriptionHandler | undefined {
    const origin = this.subscriberOrigin(subscriptionId)
    if (!origin) {
      return undefined
    }
    const subscribers = this.subscribers.get(origin)
    if (!subscribers) {
      return undefined
    }
    const handler = subscribers.get(subscriptionId)?.handler
    subscribers.delete(subscriptionId)
    if (!subscribers.size) {
      this.subscribers.delete(origin)
    } else {
      this.subscribers.set(origin, subscribers)
    }
    return handler
  }

  subscriberOrigin (subscriptionId: string): string | undefined {
    for (const [k, v] of this.subscribers) {
      if (v.has(subscriptionId)) {
        return k
      }
    }
    return undefined
  }
}
