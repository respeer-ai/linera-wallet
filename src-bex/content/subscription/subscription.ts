import { BexPayload } from '@quasar/app-vite'
import { subscription as bgSubscription } from '../../subscription'

export type SubscriptionHandler = (payload: BexPayload<bgSubscription.SubscriptionPayload, unknown>) => void

interface SubscriptionParams {
  handler: SubscriptionHandler
}

export class Subscription {
  // eslint-disable-next-line no-use-before-define
  static #instance: Subscription
  #subscribers:Map<string, SubscriptionParams>

  private constructor () {
    this.#subscribers = new Map<string, SubscriptionParams>()
  }

  public static get instance (): Subscription {
    if (!Subscription.#instance) {
      Subscription.#instance = new Subscription()
    }
    return Subscription.#instance
  }

  public static subscribe (subscriptionId: string, handler: SubscriptionHandler): string {
    Subscription.instance.#subscribers.set(subscriptionId, {
      handler
    } as SubscriptionParams)
    return subscriptionId
  }

  public static unsubscribe (subscriptionId: string): SubscriptionHandler | undefined {
    const handler = Subscription.instance.#subscribers.get(subscriptionId)?.handler
    Subscription.instance.#subscribers.delete(subscriptionId)
    return handler
  }
}
