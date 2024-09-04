import {FOLLOWS, asDecryptedEvent, readList} from '@welshman/util'
import {type TrustedEvent, type PublishedList} from '@welshman/util'
import {type SubscribeRequest} from "@welshman/net"
import {deriveEventsMapped, withGetter} from '@welshman/store'
import {repository, loadOne} from './core'
import {collection} from './collection'
import {ensurePlaintext} from './plaintext'

export const follows = withGetter(
  deriveEventsMapped<PublishedList>(repository, {
    filters: [{kinds: [FOLLOWS]}],
    itemToEvent: item => item.event,
    eventToItem: async (event: TrustedEvent) =>
      readList(
        asDecryptedEvent(event, {
          content: await ensurePlaintext(event),
        }),
      ),
  })
)

export const {
  indexStore: followsByPubkey,
  deriveItem: deriveFollows,
  loadItem: loadFollows,
} = collection({
  name: "follows",
  store: follows,
  getKey: follows => follows.event.pubkey,
  load: (pubkey: string, request: Partial<SubscribeRequest> = {}) =>
    loadOne({...request, filters: [{kinds: [FOLLOWS], authors: [pubkey]}]}),
})
