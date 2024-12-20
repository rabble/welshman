import {ctx, isNil} from "@welshman/lib"
import {Repository, Relay, LOCAL_RELAY_URL, getFilterResultCardinality} from "@welshman/util"
import type {TrustedEvent, Filter} from "@welshman/util"
import {Tracker, subscribe as baseSubscribe, SubscriptionEvent} from "@welshman/net"
import type {SubscribeRequestWithHandlers} from "@welshman/net"
import {custom} from "@welshman/store"

export const repository = new Repository<TrustedEvent>()

export const repositoryStore = custom(setter => {
  const onUpdate = () => setter(repository)

  onUpdate()
  repository.on('update', onUpdate)

  return () => repository.off('update', onUpdate)
}, {
  set: (other: Repository) => repository.load(other.dump()),
})

export const relay = new Relay(repository)

export const tracker = new Tracker()

export const trackerStore = custom(setter => {
  const onUpdate = () => setter(tracker)

  onUpdate()
  tracker.on('update', onUpdate)

  return () => tracker.off('update', onUpdate)
}, {
  set: (other: Tracker) => tracker.load(other.relaysById),
})

export type PartialSubscribeRequest = Partial<SubscribeRequestWithHandlers> & {filters: Filter[]}

export const subscribe = (request: PartialSubscribeRequest) => {
  const events: TrustedEvent[] = []

  // If we already have all results for any filter, don't send the filter to the network
  if (request.closeOnEose) {
    for (const filter of request.filters.splice(0)) {
      const cardinality = getFilterResultCardinality(filter)

      if (!isNil(cardinality)) {
        const results = repository.query([filter])

        if (results.length === cardinality) {
          for (const event of results) {
            events.push(event)
          }

          break
        }
      }

      request.filters.push(filter)
    }
  }

  // Make sure to query our local relay too
  const delay = ctx.app.requestDelay
  const authTimeout = ctx.app.authTimeout
  const timeout = request.closeOnEose ? ctx.app.requestTimeout : 0
  const sub = baseSubscribe({delay, timeout, authTimeout, relays: [], ...request})

  // Keep cached results async so the caller can set up handlers
  setTimeout(() => {
    for (const event of events) {
      sub.emitter.emit(SubscriptionEvent.Event, LOCAL_RELAY_URL, event)
    }
  })

  return sub
}

export const load = (request: PartialSubscribeRequest) =>
  new Promise<TrustedEvent[]>(resolve => {
    const sub = subscribe({closeOnEose: true, timeout: ctx.app.requestTimeout, ...request})
    const events: TrustedEvent[] = []

    sub.emitter.on(SubscriptionEvent.Event, (url: string, e: TrustedEvent) => events.push(e))
    sub.emitter.on(SubscriptionEvent.Complete, () => resolve(events))
  })
