# @welshman/store

A collection of Svelte store utilities for working with Nostr data, part of the Welshman library ecosystem. Provides typed store wrappers and utilities for handling Nostr events with Svelte's reactive store system.

## Features

- 🔄 Local storage synchronization with type safety
- 🎯 Direct value access with store getters
- 🚦 Store update throttling
- 🔧 Custom store creation with cleanup handling
- 🔄 Nostr event store derivation
- 🎨 Store adapters for type transformation

## Installation

```bash
npm install @welshman/store
```

## Basic Store Utilities

### Synchronized Storage

Create stores that automatically sync with localStorage:

```typescript
import { synced } from '@welshman/store'

// Value will be loaded from localStorage or use default if not found
const preferences = synced('user-preferences', { theme: 'dark' })
```

### Store with Getter

Add a direct value accessor to any Svelte store:

```typescript
import { withGetter } from '@welshman/store'
import { writable } from 'svelte/store'

const counter = withGetter(writable(0))
// Access value directly without subscription
const currentValue = counter.get()
```

### Throttled Updates

Throttle store updates using throttle-debounce:

```typescript
import { throttled } from '@welshman/store'

// Updates will be throttled by 300ms
const throttledStore = throttled(300, originalStore)
```

## Nostr Event Handling

### Event Store Derivation

Create stores that react to Nostr event changes:

```typescript
import { deriveEvents } from '@welshman/store'

const notes = deriveEvents(repository, {
  filters: [{ kinds: [1] }], // Filter criteria for events
  includeDeleted: false      // Whether to include deleted events
})
```

### Single Event Subscription

Subscribe to updates for a specific event:

```typescript
import { deriveEvent } from '@welshman/store'

// Automatically updates if event is modified/deleted
const note = deriveEvent(repository, eventId)
```

### Custom Event Transformation

Transform Nostr events into custom data structures with support for async transformations:

```typescript
import { deriveEventsMapped } from '@welshman/store'

const profiles = deriveEventsMapped(repository, {
  filters: [{ kinds: [0] }],
  eventToItem: event => {
    // Can return T, T[], Promise<T>, or Promise<T[]>
    const profile = JSON.parse(event.content)
    return {
      pubkey: event.pubkey,
      name: profile.name
    }
  },
  itemToEvent: profile => ({
    kind: 0,
    pubkey: profile.pubkey,
    content: JSON.stringify({ name: profile.name }),
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  }),
  throttle: 0,              // Optional throttling (default: 0)
  includeDeleted: false     // Whether to include deleted events
})
```

### Deletion Status

Monitor event deletion state:

```typescript
import { deriveIsDeleted, deriveIsDeletedByAddress } from '@welshman/store'

// Track if event has been deleted
const isDeleted = deriveIsDeleted(repository, event)

// Track if event has been deleted by address
const isDeletedByAddress = deriveIsDeletedByAddress(repository, event)
```

## Advanced Features

### Custom Store Creation

Create stores with custom initialization and cleanup:

```typescript
import { custom } from '@welshman/store'

const customStore = custom(
  // Required start function - must return cleanup function
  set => {
    set(initialValue)
    
    // Must return cleanup function
    return () => {
      // Cleanup code
    }
  },
  {
    throttle: 300,          // Optional throttling
    set: value => {         // Optional custom set handler
      console.log('Store updated:', value)
    }
  }
)
```

### Store Type Adapters

Transform data between different types while maintaining reactivity:

```typescript
import { adapter } from '@welshman/store'

const dateStore = writable(new Date())
const timestampStore = adapter({
  store: dateStore,
  forward: date => date.getTime(),    // Date -> number
  backward: timestamp => new Date(timestamp) // number -> Date
})

// timestampStore is now a derived store of numbers
// that stays in sync with dateStore
```

## Implementation Notes

- Event updates are batched with a 300ms window to prevent rapid re-rendering
- Repository queries are synchronous, but event transformations can be async
- All stores with getters maintain their own internal value cache
- Adapters create derived stores with transformation methods

## Types

Key TypeScript types:

```typescript
type WritableWithGetter<T> = Writable<T> & {get: () => T}
type ReadableWithGetter<T> = Readable<T> & {get: () => T}

type CustomStoreOpts<T> = {
  throttle?: number
  set?: (x: T) => void
}

type DeriveEventsMappedOptions<T> = {
  filters: Filter[]
  eventToItem: (event: TrustedEvent) => Maybe<T | T[] | Promise<T | T[]>>
  itemToEvent: (item: T) => TrustedEvent
  throttle?: number
  includeDeleted?: boolean
}
```

## Related Packages

- @welshman/lib - Core utilities
- @welshman/util - Nostr utilities

## License

[Add your chosen license here]