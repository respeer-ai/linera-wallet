import { BexBridge } from '@quasar/app-vite'

export class EventBus {
  // eslint-disable-next-line no-use-before-define
  static #instance: EventBus
  #bridge?: BexBridge

  public static get instance (): EventBus {
    if (!EventBus.#instance) {
      EventBus.#instance = new EventBus()
    }
    return EventBus.#instance
  }

  public setBridge (bridge: BexBridge) {
    EventBus.#instance.#bridge = bridge
  }

  private getBridge (): BexBridge | undefined {
    return this.#bridge
  }

  public static get bridge () {
    return EventBus.instance.getBridge()
  }
}
