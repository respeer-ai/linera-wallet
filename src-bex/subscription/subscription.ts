import { unsafeRandomBytes } from '@metamask/eth-json-rpc-filters/hexUtils'

export type SubscriptionHandler = (
  subscriptionId: string,
  payload: unknown
) => Promise<void>

interface SubscriptionParams {
  topics: string[]
  handler: SubscriptionHandler
}

export interface SubscriptionPayload {
  subscriptionId: string
  payload: unknown
}

export class Subscription {
  // eslint-disable-next-line no-use-before-define
  static #instance: Subscription
  #subscribers: Map<string, SubscriptionParams>

  private constructor() {
    this.#subscribers = new Map<string, SubscriptionParams>()
  }

  public static get instance(): Subscription {
    if (!Subscription.#instance) {
      Subscription.#instance = new Subscription()
    }
    return Subscription.#instance
  }

  public static subscribe(
    topics: string[],
    handler: SubscriptionHandler
  ): string {
    const subscriptionId = unsafeRandomBytes(16)
    Subscription.instance.#subscribers.set(subscriptionId, {
      topics,
      handler
    } as SubscriptionParams)
    return subscriptionId
  }

  public static unsubscribe(
    subscriptionId: string
  ): SubscriptionHandler | undefined {
    const handler =
      Subscription.instance.#subscribers.get(subscriptionId)?.handler
    Subscription.instance.#subscribers.delete(subscriptionId)
    return handler
  }

  public static handle(data: unknown) {
    Subscription.instance.#subscribers.forEach((subscriber, subscriptionId) => {
      try {
        // TODO: here we should filter topics
        void subscriber.handler(subscriptionId, data)
      } catch (e) {
        console.log('Failed process data', e)
      }
    })
  }
}
