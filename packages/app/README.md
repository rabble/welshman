# @welshman/client

A comprehensive Nostr client library for building rich nostr applications. Provides sophisticated relay management, data synchronization, caching, routing, and user management capabilities.

## Table of Contents

1. [Core Systems](#core-systems)
   - [Repository & Events](#repository--events)  
   - [Router](#router)
   - [Feed System](#feed-system)
   - [Session Management](#session-management)
   - [Collections](#collections)

2. [Use Cases](#use-cases)
   - [Event Publishing](#event-publishing)
   - [Event Subscription](#event-subscription)
   - [Profile Management](#profile-management)
   - [Relay Management](#relay-management)
   - [User Relationships](#user-relationships)

3. [Cross-Reference Index](#cross-reference-index)

## Core Systems

### Repository & Events

The core event storage and management system.

```typescript
import { repository, load, subscribe } from '@welshman/client'

// Query existing events
const events = repository.query({
  kinds: [1],
  authors: ['pubkey'],
  since: timestamp
})

// Subscribe to new events
const sub = subscribe({
  filters: [{
    kinds: [1],
    authors: ['pubkey']
  }],
  onEvent: (event) => console.log(event),
  closeOnEose: true,
  timeout: 3000
})

// Load events with promise
const events = await load({
  filters: [{
    kinds: [1],
    authors: ['pubkey'] 
  }]
})
```

The repository supports:
- Event querying with complex filters
- Event deletion tracking
- Event replacement tracking
- Local caching via IndexedDB
- Automatic deduplication
- Event validation

### Router

Advanced relay selection and routing system.

```typescript
import { makeRouter, RelayMode } from '@welshman/client'

const router = makeRouter({
  // Get relays for a specific pubkey
  getPubkeyRelays: (pubkey: string, mode?: RelayMode) => string[],
  
  // Get fallback relays
  getFallbackRelays: () => string[],
  
  // Get quality score for relay
  getRelayQuality: (url: string) => number,
  
  // Maximum relays to use
  getLimit: () => number
})

// Different routing scenarios
const userRelays = router.ForUser().getUrls()
const pubkeyRelays = router.ForPubkey(pubkey).getUrls()
const publishRelays = router.PublishEvent(event).getUrls()
const ancestorRelays = router.EventAncestors(event, "replies").getUrls()
```

Supports sophisticated relay selection based on:
- Write vs read operations
- Event kinds
- Author pubkeys
- Relay quality scores
- Load balancing
- Fallback policies

### Feed System

Composable feed construction and management.

```typescript
import { createFeedController, FeedType } from '@welshman/client'

// Create feed controller
const controller = createFeedController({
  feed: [
    FeedType.Intersection,
    [FeedType.Kind, 1], // Notes
    [FeedType.Author, pubkey],
    [FeedType.WOT, { min: 0.1 }] // WOT score threshold
  ],
  onEvent: (event) => console.log(event),
  onExhausted: () => console.log("Feed complete")
})

// Load events
await controller.load(20)
```

Feed Types:
```typescript
enum FeedType {
  Address,      // naddr1... references
  Author,       // Specific pubkeys
  CreatedAt,    // Time-based filters
  DVM,          // DVM request results
  Difference,   // Set difference
  ID,           // Event IDs
  Intersection, // Set intersection
  Global,       // Global feed
  Kind,         // Event kinds
  List,         // List-based feeds
  Label,        // NIP-32 labels
  WOT,          // Web of Trust
  Relay,        // Specific relays
  Scope,        // Contextual scopes
  Search,       // Text search
  Tag,          // Generic tags
  Union         // Set union
}
```

### Session Management

Multi-protocol signer and session management.

```typescript
import { 
  addSession, 
  dropSession, 
  signer,
  updateSession,
  getSession,
  nip44EncryptToSelf 
} from '@welshman/client'

// Add NIP-07 session
addSession({
  method: 'nip07',
  pubkey: 'user-pubkey'
})

// Add NIP-46 session 
addSession({
  method: 'nip46',
  pubkey: 'user-pubkey',
  secret: 'client-secret',
  handler: {
    pubkey: 'signer-pubkey',
    relays: ['wss://relay.example.com']
  }
})

// Get current signer
const currentSigner = signer.get()

// Encrypt content to self
const encrypted = await nip44EncryptToSelf(content)

// Update session
updateSession(pubkey, session => ({
  ...session,
  lastUsed: Date.now()
}))

// Remove session
dropSession(pubkey)
```

Supported signer types:
- NIP-01 (Private key)
- NIP-07 (Browser extension)
- NIP-46 (Remote signer)
- NIP-55 (External signer)

### Collections

Generic collection management with caching and lazy loading.

```typescript
import { collection } from '@welshman/client'

const {
  indexStore,        // Map store of items by key
  deriveItem,        // Get single item as store
  loadItem          // Load single item
} = collection({
  name: "collection-name",
  store: itemStore,
  getKey: (item) => item.id,
  load: async (key) => {
    // Load item logic
  }
})

// Get item store
const item = deriveItem('item-key')

// Force load
await loadItem('item-key')
```

Features:
- Automatic stale data handling
- Smart caching
- Batched loading
- Exponential backoff
- IndexedDB persistence

## Use Cases

### Event Publishing

```typescript
import { publishThunk, tagEvent, tagPubkey } from '@welshman/client'

// Create event tags
const tags = [
  ...tagPubkey(targetPubkey),
  ...tagEvent(parentEvent, "reply")
]

// Publish event
const thunk = await publishThunk({
  event: {
    kind: 1,
    content: "Hello Nostr!",
    tags
  },
  relays: ['wss://relay.example.com']
})

// Monitor status
thunk.status.subscribe(status => {
  console.log("Publish status:", status)
})
```

[Continue with other major sections...]

I'm happy to continue documenting the remaining major sections in the same level of detail. Would you like me to continue with the rest of the use cases and cross-reference index?

### Event Subscription

Event subscription and synchronization with relay support.

```typescript
import { 
  subscribe, 
  sync, 
  pull, 
  push,
  repository 
} from '@welshman/client'

// Basic subscription
const sub = subscribe({
  filters: [{
    kinds: [1],
    authors: ['pubkey'],
    since: timestamp
  }],
  onEvent: (event) => console.log(event),
  closeOnEose: true,
  timeout: 3000
})

// Sync with relays (with negentropy support)
await sync({
  relays: ['wss://relay.example.com'],
  filters: [{
    kinds: [1],
    authors: ['pubkey']
  }]
})

// Pull only
await pull({
  relays: ['wss://relay.example.com'],
  filters: [{
    kinds: [1],
    authors: ['pubkey']
  }]
})

// Push only
await push({
  relays: ['wss://relay.example.com'],
  filters: [{
    kinds: [1],
    authors: ['pubkey']
  }]
})
```

### Profile Management

Comprehensive profile handling with caching and updates.

```typescript
import { 
  profiles, 
  profilesByPubkey,
  deriveProfile,
  loadProfile,
  displayProfileByPubkey,
  deriveProfileDisplay,
  profileSearch
} from '@welshman/client'

// Get all profiles
const allProfiles = profiles.get()

// Get profile by pubkey
const profile = profilesByPubkey.get().get(pubkey)

// Get profile as store
const profileStore = deriveProfile(pubkey)

// Force profile load
await loadProfile(pubkey)

// Display helpers
const displayName = displayProfileByPubkey(pubkey)
const displayStore = deriveProfileDisplay(pubkey)

// Search profiles
const searchResults = derived(profileSearch, $search => 
  $search.searchOptions("name")
)
```

### Relay Management

Sophisticated relay management with quality scoring and statistics.

```typescript
import {
  relays,
  relaysByUrl,
  relaysByPubkey,
  deriveRelay,
  loadRelay,
  trackRelayStats,
  displayRelayByPubkey
} from '@welshman/client'

// Get relay information
const relay = relaysByUrl.get().get('wss://relay.example.com')

// Get relays for pubkey
const pubkeyRelays = relaysByPubkey.get().get(pubkey)

// Track relay stats
const cleanup = trackRelayStats(connection)

// Stats tracked:
type RelayStats = {
  first_seen: number
  recent_errors: number[]
  open_count: number
  close_count: number
  publish_count: number
  request_count: number
  event_count: number
  last_open: number
  last_close: number
  last_error: number
  last_publish: number
  last_request: number
  last_event: number
  last_auth: number
  publish_timer: number
  publish_success_count: number
  publish_failure_count: number
  eose_count: number
  eose_timer: number
  notice_count: number
}
```

### User Relationships

Web of Trust and user relationship management.

```typescript
import {
  follows,
  followsByPubkey,
  mutes,
  mutesByPubkey,
  getFollows,
  getMutes,
  getNetwork,
  getFollowers,
  getMuters,
  wotGraph,
  getWotScore
} from '@welshman/client'

// Get user follows
const userFollows = getFollows(pubkey)

// Get user mutes
const userMutes = getMutes(pubkey)

// Get extended network
const network = getNetwork(pubkey)

// Get followers
const followers = getFollowers(pubkey)

// Get WOT score
const score = getWotScore(pubkeyA, pubkeyB)

// Monitor WOT graph changes
wotGraph.subscribe($graph => {
  console.log("WOT updated:", $graph)
})
```

### Search & Discovery

```typescript
import {
  profileSearch,
  topicSearch,
  relaySearch,
  searchProfiles
} from '@welshman/client'

// Search profiles
const profiles = derived(profileSearch, $search => {
  return $search.searchOptions("query")
})

// Search topics
const topics = derived(topicSearch, $search => {
  return $search.searchOptions("nostr")
})

// Search relays
const relays = derived(relaySearch, $search => {
  return $search.searchOptions("relay.example.com")
})

// Force profile search
searchProfiles("query")
```

### Storage & Persistence

```typescript
import {
  initStorage,
  closeStorage,
  clearStorage,
  storageAdapters
} from '@welshman/client'

// Initialize storage
await initStorage("app-name", 1, {
  // Repository adapter
  events: storageAdapters.fromRepository(repository),
  
  // Map store adapter
  data: storageAdapters.fromMapStore(dataStore),
  
  // Object store adapter
  settings: storageAdapters.fromObjectStore(settingsStore),
  
  // Tracker adapter
  tracker: storageAdapters.fromTracker(tracker)
})

// Clean shutdown
await closeStorage()

// Clear all data
await clearStorage()
```

## Type Definitions

### Core Types

```typescript
type Feed = 
  | AddressFeed 
  | AuthorFeed
  | CreatedAtFeed
  | DVMFeed
  | DifferenceFeed
  | IDFeed
  | IntersectionFeed
  | GlobalFeed
  | KindFeed
  | ListFeed
  | LabelFeed
  | WOTFeed
  | RelayFeed
  | ScopeFeed
  | SearchFeed
  | TagFeed
  | UnionFeed

type Session = 
  | SessionNip01 
  | SessionNip07
  | SessionNip46
  | SessionNip55
  | SessionPubkey

type RouterOptions = {
  getUserPubkey?: () => string | null
  getPubkeyRelays?: (pubkey: string, mode?: RelayMode) => string[]
  getFallbackRelays: () => string[]
  getIndexerRelays?: () => string[]
  getSearchRelays?: () => string[]
  getRelayQuality?: (url: string) => number
  getLimit?: () => number
}

type FeedOptions = {
  feed: Feed
  request: (opts: RequestOpts) => Promise<void>
  requestDVM: (opts: DVMOpts) => Promise<void>
  getPubkeysForScope: (scope: Scope) => string[]
  getPubkeysForWOTRange: (min: number, max: number) => string[]
  onEvent?: (event: TrustedEvent) => void
  onExhausted?: () => void
  useWindowing?: boolean
}
```

## Configuration Options

### App Context

Global application configuration.

```typescript
import { getDefaultAppContext } from '@welshman/client'

const context = getDefaultAppContext({
  router: customRouter,          // Custom router instance
  requestDelay: 50,             // Delay between requests (ms)
  authTimeout: 300,             // Auth timeout (ms)
  requestTimeout: 3000,         // Request timeout (ms)
  dufflepudUrl?: string,        // Optional dufflepud service URL
  indexerRelays?: string[]      // Optional indexer relays
})
```

### Network Context

Network-level configuration.

```typescript
import { getDefaultNetContext } from '@welshman/client'

const netContext = getDefaultNetContext({
  signEvent: async (event) => {
    // Custom signing logic
    return signedEvent
  },
  onEvent: (url, event) => {
    // Custom event handling
  },
  isDeleted: (url, event) => boolean,
  optimizeSubscriptions: (subs) => {
    // Custom subscription optimization
    return optimizedSelections
  }
})
```

## Advanced Usage Patterns

### Collection Management

Creating custom collections with caching.

```typescript
import { collection } from '@welshman/client'

const {
  indexStore,
  deriveItem,
  loadItem
} = collection({
  name: "custom-collection", // For cache management
  store: itemStore,         // Svelte store of items
  getKey: item => item.id,  // Key extraction function
  load: async (key, ...args) => {
    // Custom loading logic
    // Supports batching and caching
    const result = await fetchItem(key, ...args)
    return result
  }
})

// The collection automatically handles:
// - Caching with freshness checks
// - Exponential backoff for failed loads
// - Batching of concurrent requests
// - IndexedDB persistence
```

### Web of Trust Integration

Custom WOT scoring and network analysis.

```typescript
import {
  wotGraph,
  maxWot,
  getFollowsWhoFollow,
  getFollowsWhoMute,
  getUserWotScore,
  deriveUserWotScore
} from '@welshman/client'

// Get users who both follow targetPubkey and are followed by sourcePubkey
const mutualFollowers = getFollowsWhoFollow(sourcePubkey, targetPubkey)

// Get users who mute targetPubkey and are followed by sourcePubkey
const trustedMuters = getFollowsWhoMute(sourcePubkey, targetPubkey)

// Get WOT score as reactive store
const scoreStore = deriveUserWotScore(targetPubkey)

// Monitor maximum WOT score
maxWot.subscribe(maxScore => {
  console.log("Maximum WOT score:", maxScore)
})

// Access full WOT graph
wotGraph.subscribe(graph => {
  // Graph is Map<pubkey, score>
  for (const [pubkey, score] of graph.entries()) {
    console.log(`${pubkey}: ${score}`)
  }
})
```

### Relay Selection Strategy

Custom relay selection and routing.

```typescript
import { Router, RouterScenario, Selection } from '@welshman/client'

class CustomRouter extends Router {
  constructor(options: RouterOptions) {
    super(options)
  }

  // Custom routing scenario
  CustomScenario = (params: any) => {
    return this.scenario([{
      weight: 1.0,
      relays: this.getRelaysForCustomCase(params)
    }])
  }

  // Custom selection logic
  getRelaysForCustomCase(params: any): string[] {
    // Custom relay selection logic
    return selectedRelays
  }
}

// Usage
const router = new CustomRouter({
  getRelayQuality: (url) => {
    // Custom quality scoring
    return qualityScore
  },
  getFallbackRelays: () => {
    // Custom fallback selection
    return fallbackRelays
  }
})
```

### Advanced Event Publishing

Complex event publishing with status tracking.

```typescript
import { 
  publishThunks, 
  ThunkStatus,
  PublishStatus 
} from '@welshman/client'

// Publish multiple events
const mergedThunk = publishThunks([
  {
    event: event1,
    relays: relays1,
    delay: 1000  // Delayed publish
  },
  {
    event: event2,
    relays: relays2
  }
])

// Monitor combined status
mergedThunk.status.subscribe((statusByUrl) => {
  for (const [url, status] of Object.entries(statusByUrl)) {
    switch (status.status) {
      case PublishStatus.Success:
        console.log(`Published to ${url}`)
        break
      case PublishStatus.Failure:
        console.log(`Failed on ${url}: ${status.message}`)
        break
      case PublishStatus.Timeout:
        console.log(`Timeout on ${url}`)
        break
    }
  }
})

// Wait for completion
const results = await mergedThunk.result
```

### Event Synchronization

Advanced sync strategies with negentropy support.

```typescript
import { sync, pull, push, hasNegentropy } from '@welshman/client'

// Check relay capabilities
const supportsNegentropy = hasNegentropy(relayUrl)

// Sync specific kinds
await sync({
  relays: [relayUrl],
  filters: [{
    kinds: [0, 1, 3],
    authors: [pubkey],
    since: timestamp
  }]
})

// Pull only newer events
await pull({
  relays: [relayUrl],
  filters: [{
    since: timestamp
  }]
})

// Push local events
await push({
  relays: [relayUrl],
  filters: [{
    authors: [pubkey]
  }]
})
```

## Error Handling

```typescript
import { tryCatch } from '@welshman/lib'

// Safe profile querying
const profile = await tryCatch(async () => {
  const result = await queryProfile(nip05)
  return result
})

// Safe relay connection
const connection = await tryCatch(async () => {
  const conn = await connectRelay(url)
  return conn
}, {
  onError: (error) => {
    console.error(`Failed to connect to ${url}:`, error)
  }
})

// Handle encryption errors
try {
  const encrypted = await nip44EncryptToSelf(content)
} catch (e) {
  if (String(e).match(/invalid base64/)) {
    // Handle encoding error
  } else {
    // Handle other errors
    throw e
  }
}
```

## Extension Points

### Custom Collections

Extending the collection system for custom data types.

```typescript
import { collection, deriveEventsMapped } from '@welshman/client'

// Create a custom mapped event collection
const customEvents = deriveEventsMapped(repository, {
  filters: [{kinds: [customKind]}],
  eventToItem: (event) => {
    // Custom event transformation
    // Can return T, T[], Promise<T>, or Promise<T[]>
    return transformEvent(event)
  },
  itemToEvent: (item) => {
    // Transform back to event
    return createEvent(customKind, {
      content: JSON.stringify(item)
    })
  },
  throttle: 300,            // Optional throttling
  includeDeleted: false     // Whether to include deleted events
})

// Create a managed collection
const {
  indexStore,
  deriveItem,
  loadItem
} = collection({
  name: "custom-events",
  store: customEvents,
  getKey: item => item.id,
  load: async (key) => {
    // Custom loading with exponential backoff
    // and caching built-in
  }
})
```

### Custom Relay Selection

Implementing custom relay selection strategies.

```typescript
import { 
  RouterScenario, 
  RelayMode,
  FallbackPolicy
} from '@welshman/client'

// Custom fallback policy
const customFallbacks: FallbackPolicy = (count, limit) => {
  // Return number of fallback relays to add
  return Math.max(0, limit - count)
}

// Custom scenario
const scenario = router
  .FromRelays(primaryRelays)
  .filter(selection => {
    // Custom filtering
    return selection.weight > 0.5
  })
  .update(selection => ({
    // Modify selection weights
    ...selection,
    weight: selection.weight * 1.5
  }))
  .policy(customFallbacks)
  .limit(5)

// Get URLs based on custom scenario
const relayUrls = scenario.getUrls()
```

### Custom Search Providers

```typescript
import { createSearch } from '@welshman/client'

const customSearch = derived(
  [customStore], 
  ([$items]) => createSearch($items, {
    // Transform item to searchable value
    getValue: (item) => item.id,
    
    // Optional search trigger
    onSearch: (term) => {
      // Trigger external search
    },
    
    // Custom sort function
    sortFn: ({score, item}) => {
      if (score > 0.1) return -score
      return calculateCustomScore(item)
    },
    
    // Fuse.js options
    fuseOptions: {
      keys: [
        {name: "primary", weight: 1.0},
        {name: "secondary", weight: 0.5}
      ],
      threshold: 0.3,
      shouldSort: false
    }
  })
)
```

## Integration Patterns

### Working with External Services

```typescript
import { 
  fetchZappers,
  fetchHandles,
  fetchRelayProfiles 
} from '@welshman/client'

// Fetch zapper info
const zappers = await fetchZappers(lnurls)

// Fetch NIP-05 handles
const handles = await fetchHandles(nip05s)

// Fetch relay info
const relayProfiles = await fetchRelayProfiles(urls)

// Using dufflepud service
const context = getDefaultAppContext({
  dufflepudUrl: "https://dufflepud.example.com"
})
```

### Persisting State

```typescript
import { 
  initStorage,
  storageAdapters,
  closeStorage
} from '@welshman/client'

// Initialize storage with multiple adapters
await initStorage("app-name", 1, {
  // Repository events
  events: storageAdapters.fromRepository(repository, {
    throttle: 1000,
    migrate: (events) => {
      // Optional migration logic
      return migratedEvents
    }
  }),
  
  // Map-based store
  metadata: storageAdapters.fromMapStore(metadataStore, {
    throttle: 500
  }),
  
  // Object-based store
  settings: storageAdapters.fromObjectStore(settingsStore)
})

// Clean shutdown
window.addEventListener("beforeunload", () => {
  closeStorage()
})
```

### Timestamp Handling

```typescript
import {
  formatTimestamp,
  formatTimestampAsDate,
  formatTimestampAsTime,
  formatTimestampRelative
} from '@welshman/client'

// Full timestamp
const full = formatTimestamp(event.created_at)
// "3/4/24, 2:30 PM"

// Date only
const date = formatTimestampAsDate(event.created_at)
// "March 4, 2024"

// Time only
const time = formatTimestampAsTime(event.created_at)
// "2:30 PM"

// Relative time
const relative = formatTimestampRelative(event.created_at)
// "2 hours ago"
```

## Performance Optimization

### Batching and Throttling

```typescript
import { batch, throttle } from '@welshman/lib'

// Batch updates
const batchedUpdate = batch(300, (updates) => {
  // Process multiple updates together
  store.update(state => {
    for (const update of updates) {
      applyUpdate(state, update)
    }
    return state
  })
})

// Throttle operations
const throttledOperation = throttle(1000, () => {
  // Executed at most once per second
  performExpensiveOperation()
})
```

### Smart Loading

```typescript
// Collection auto-manages:
const { loadItem } = collection({
  name: "items",
  store: itemStore,
  getKey: item => item.id,
  load: async (key) => {
    // Automatic features:
    // - Caches results for 1 hour
    // - Exponential backoff for failed requests
    // - Batches concurrent requests
    // - Deduplicates in-flight requests
    return await fetchItem(key)
  }
})
```

### Efficient Event Handling

```typescript
// Subscribe with local cache check
const sub = subscribe({
  filters: [{
    kinds: [1],
    authors: [pubkey]
  }],
  closeOnEose: true,
  
  // Checks repository before making requests
  // Only requests what's needed
})

// Use windowing for large datasets
const controller = createFeedController({
  feed: [FeedType.Kind, 1],
  useWindowing: true  // Enable time-based windowing
})

// Load in chunks
await controller.load(20) // First 20
await controller.load(20) // Next 20
```

## Cross-Reference Index

### Event Publishing Flow
1. `publishThunk()` - Main publishing entry point
2. `prepEvent()` - Prepares event for publishing
3. `repository.publish()` - Adds to local cache
4. `tracker.track()` - Tracks relay success

### Data Loading Flow
1. `collection.loadItem()` - Initiates load
2. `getFreshness()` - Checks cache status
3. `load()` - Performs network request
4. `repository.query()` - Checks local cache
5. `subscribe()` - Sets up subscription

### Relay Selection Flow
1. `router.getUrls()` - Entry point
2. `getRelayQuality()` - Scores relays
3. `getFallbackRelays()` - Gets fallbacks
4. `addMaximalFallbacks()` - Applies policy

## Debugging & Monitoring

### Relay Statistics

Monitor relay performance and health.

```typescript
import { relaysByUrl, RelayStats } from '@welshman/client'

// Get relay stats
const relay = relaysByUrl.get().get(url)
const stats = relay?.stats

// Available metrics
type RelayStats = {
  first_seen: number          // First connection timestamp
  recent_errors: number[]     // Last 10 error timestamps
  open_count: number          // Total connection opens
  close_count: number         // Total connection closes
  publish_count: number       // Total publish attempts
  request_count: number       // Total subscription requests
  event_count: number         // Total events received
  last_open: number          // Last connection timestamp
  last_close: number         // Last disconnection timestamp
  last_error: number         // Last error timestamp
  last_publish: number       // Last publish timestamp
  last_request: number       // Last request timestamp
  last_event: number         // Last event received timestamp
  last_auth: number          // Last auth timestamp
  publish_timer: number      // Cumulative publish time
  publish_success_count: number
  publish_failure_count: number
  eose_count: number         // End of stored events count
  eose_timer: number         // Cumulative EOSE response time
  notice_count: number       // Relay notices received
}

// Monitor relay quality
const quality = getRelayQuality(url)
// Returns 0-1 score based on:
// - Recent errors (last 5 seconds)
// - Error frequency (per minute/hour/day)
// - Connection stability
```

### Event Publishing Status

```typescript
import { thunks, PublishStatus } from '@welshman/client'

// Monitor all active thunks
thunks.subscribe($thunks => {
  for (const [eventId, thunk] of Object.entries($thunks)) {
    thunk.status.subscribe(statusByUrl => {
      for (const [url, status] of Object.entries(statusByUrl)) {
        console.log(`Event ${eventId} on ${url}: ${status.status}`)
        if (status.message) {
          console.log(`Message: ${status.message}`)
        }
      }
    })
  }
})

// Status types
enum PublishStatus {
  Pending,   // Awaiting response
  Success,   // Published successfully
  Failure,   // Publish failed
  Timeout,   // No response in time
  Aborted    // Cancelled by user
}
```

### Repository Monitoring

```typescript
import { repository, repositoryStore } from '@welshman/client'

// Monitor all repository changes
repositoryStore.subscribe($repo => {
  console.log("Total events:", $repo.size)
  console.log("Deleted events:", $repo.deletedEvents.size)
  console.log("Events by kind:", $repo.eventsByKind)
  console.log("Events by tag:", $repo.eventsByTag)
})

// Monitor specific queries
const events = repository.query({
  kinds: [1],
  authors: [pubkey],
  since: timestamp
})

console.log("Query results:", {
  total: events.length,
  newest: events[0]?.created_at,
  oldest: events[events.length - 1]?.created_at
})
```

## Common Use Cases

### Building a Timeline

```typescript
import { 
  createFeedController,
  FeedType,
  tagEvent,
  tagReplyTo
} from '@welshman/client'

// Create timeline feed
const controller = createFeedController({
  feed: [
    FeedType.Intersection,
    [FeedType.Kind, 1],              // Notes
    [FeedType.WOT, { min: 0.1 }],    // Min WOT score
    [FeedType.CreatedAt, {           // Time window
      since: timestamp,
      until: timestamp + DAY
    }]
  ],
  onEvent: event => {
    // Process new event
  },
  onExhausted: () => {
    // No more events available
  }
})

// Load timeline
await controller.load(50)  // Initial load
await controller.load(20)  // Load more

// Reply to post
const replyEvent = {
  kind: 1,
  content: "Reply content",
  tags: tagReplyTo(parentEvent)
}

await publishThunk({
  event: replyEvent,
  relays: router.PublishEvent(replyEvent).getUrls()
})
```

### User Profiles

```typescript
import {
  deriveProfile,
  deriveFollows,
  deriveMutes,
  deriveHandleForPubkey,
  deriveZapperForPubkey,
  getWotScore,
  getNetwork
} from '@welshman/client'

// Get full user data
const profile = deriveProfile(pubkey)
const follows = deriveFollows(pubkey)
const mutes = deriveMutes(pubkey)
const handle = deriveHandleForPubkey(pubkey)
const zapper = deriveZapperForPubkey(pubkey)

// Get social graph
const wotScore = getWotScore(pubkey)
const network = getNetwork(pubkey)
const score = getUserWotScore(pubkey)

// Monitor changes
profile.subscribe($profile => {
  console.log("Profile updated:", $profile)
})

// Force refresh
await loadProfile(pubkey)
await loadFollows(pubkey)
await loadMutes(pubkey)
```

### Search Implementation

```typescript
import {
  profileSearch,
  topicSearch,
  relaySearch,
  createSearch
} from '@welshman/client'

// Profile search
const profiles = derived(profileSearch, $search => {
  const results = $search.searchOptions("query")
  return results.map(profile => ({
    pubkey: profile.event.pubkey,
    name: profile.name,
    nip05: profile.nip05,
    wotScore: getWotScore(profile.event.pubkey)
  }))
})

// Topic search
const topics = derived(topicSearch, $search => {
  return $search.searchOptions("nostr").map(topic => ({
    name: topic.name,
    count: topic.count
  }))
})

// Custom search
const customSearch = derived([customStore], ([$items]) =>
  createSearch($items, {
    getValue: item => item.id,
    fuseOptions: {
      keys: ["name", "description"],
      threshold: 0.3
    },
    sortFn: ({score, item}) => {
      // Custom scoring logic
      return score ? -score : 0
    }
  })
)
```
## Complete API Reference

### Repository API

Core event storage and querying functionality.

```typescript
class Repository {
  // Event access
  getEvent(id: string): TrustedEvent | undefined
  query(filters: Filter[]): TrustedEvent[]
  
  // Event management
  publish(event: TrustedEvent): void
  removeEvent(id: string): void
  
  // Deletion tracking
  isDeleted(event: TrustedEvent): boolean
  isDeletedByAddress(event: TrustedEvent): boolean
  
  // State management
  dump(): TrustedEvent[]
  load(events: TrustedEvent[]): void
  
  // Event counts
  get size(): number
  get deletedEvents(): Set<string>
  get eventsByKind(): Map<number, Set<string>>
  get eventsByTag(): Map<string, Set<string>>
}
```

### Feed Controller API

Feed management and loading.

```typescript
class FeedController {
  constructor(options: FeedOptions)
  
  // Core methods
  load(limit: number): Promise<void>
  getRequestItems(): Promise<RequestItem[] | undefined>
  getLoader(): Promise<(limit: number) => Promise<void>>
  
  // Internal loaders
  _getRequestsLoader(requests: RequestItem[], overrides?: Partial<FeedOptions>)
  _getRequestLoader(request: RequestItem, overrides?: Partial<FeedOptions>)
  _getDifferenceLoader(feeds: Feed[], overrides?: Partial<FeedOptions>)
  _getIntersectionLoader(feeds: Feed[], overrides?: Partial<FeedOptions>)
  _getUnionLoader(feeds: Feed[], overrides?: Partial<FeedOptions>)
}
```

### Router API

Relay selection and routing functionality.

```typescript
class Router {
  // Core routing
  ForUser(): RouterScenario         // User's read relays
  FromUser(): RouterScenario        // User's write relays
  UserInbox(): RouterScenario       // User's inbox relays
  
  // Pubkey routing
  ForPubkey(pubkey: string): RouterScenario    // Read
  FromPubkey(pubkey: string): RouterScenario   // Write
  PubkeyInbox(pubkey: string): RouterScenario  // Inbox
  
  // Multiple pubkeys
  ForPubkeys(pubkeys: string[]): RouterScenario
  FromPubkeys(pubkeys: string[]): RouterScenario
  PubkeyInboxes(pubkeys: string[]): RouterScenario
  
  // Event routing
  Event(event: TrustedEvent): RouterScenario
  Replies(event: TrustedEvent): RouterScenario
  Quote(event: TrustedEvent, value: string, relays?: string[]): RouterScenario
  
  // Event ancestry
  EventAncestors(event: TrustedEvent, type: "mentions" | "replies" | "roots"): RouterScenario
  EventMentions(event: TrustedEvent): RouterScenario
  EventParents(event: TrustedEvent): RouterScenario
  EventRoots(event: TrustedEvent): RouterScenario
  
  // Publishing
  PublishEvent(event: TrustedEvent): RouterScenario
}
```

### Collection API

Generic collection management.

```typescript
interface CollectionOptions<T, LoadArgs extends any[]> {
  name: string                                      // Collection name
  store: Readable<T[]>                             // Base store
  getKey: (item: T) => string                      // Key extractor
  load?: (key: string, ...args: LoadArgs) => Promise<any>  // Loader
}

interface Collection<T, LoadArgs extends any[]> {
  indexStore: ReadableWithGetter<Map<string, T>>   // Item index
  deriveItem: (key: Maybe<string>, ...args: LoadArgs) => Readable<T | undefined>
  loadItem: (key: string, ...args: LoadArgs) => Promise<T | undefined>
}
```

### Sync API

Event synchronization with relays.

```typescript
interface SyncOptions {
  relays: string[]
  filters: Filter[]
}

// Full sync
function sync(opts: SyncOptions): Promise<void>

// Pull only
function pull(opts: SyncOptions): Promise<void>

// Push only
function push(opts: SyncOptions): Promise<void>

// Negentropy support check
function hasNegentropy(url: string): boolean
```

### Thunk API

Event publishing and status tracking.

```typescript
interface ThunkRequest {
  event: ThunkEvent
  relays: string[]
  delay?: number
}

interface Thunk {
  event: TrustedEvent
  request: ThunkRequest
  controller: AbortController
  result: Promise<ThunkStatusByUrl>
  status: Writable<ThunkStatusByUrl>
}

// Publishing
function publishThunk(request: ThunkRequest): Thunk
function publishThunks(requests: ThunkRequest[]): MergedThunk

// Status monitoring
type ThunkStatus = {
  message: string
  status: PublishStatus
}

type ThunkStatusByUrl = Record<string, ThunkStatus>
```

### Search API

Search functionality for different data types.

```typescript
interface SearchOptions<V, T> {
  getValue: (item: T) => V
  fuseOptions?: IFuseOptions<T>
  onSearch?: (term: string) => void
  sortFn?: (items: FuseResult<T>) => any
}

interface Search<V, T> {
  options: T[]
  getValue: (item: T) => V
  getOption: (value: V) => T | undefined
  searchOptions: (term: string) => T[]
  searchValues: (term: string) => V[]
}

// Create custom search
function createSearch<V, T>(
  options: T[], 
  opts: SearchOptions<V, T>
): Search<V, T>

// Built-in searches
const profileSearch: Readable<Search<string, PublishedProfile>>
const topicSearch: Readable<Search<string, Topic>>
const relaySearch: Readable<Search<string, Relay>>
```

## Advanced Integration Patterns

### Custom Event Processing

```typescript
import { repository, subscribe } from '@welshman/client'

// Process events as they arrive
subscribe({
  filters: [{
    kinds: [customKind],
    authors: [pubkey]
  }],
  onEvent: async (event) => {
    // Custom processing
    const processed = await processEvent(event)
    
    // Store processed data
    processedStore.update(store => ({
      ...store,
      [event.id]: processed
    }))
  }
})

// Query and process existing events
const events = repository.query({
  kinds: [customKind],
  authors: [pubkey]
})

for (const event of events) {
  // Custom processing
  // ...
}
```

## Store Reference

### Profile Stores

```typescript
import {
  profiles,              // All profiles
  profilesByPubkey,      // Map<pubkey, PublishedProfile>
  deriveProfile,         // Get single profile store
  loadProfile,           // Force profile load
  userProfile           // Current user's profile
} from '@welshman/client'

// Types
type PublishedProfile = {
  event: TrustedEvent
  name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud06?: string
  lud16?: string
  display_name?: string
}
```

### Relationship Stores

```typescript
import {
  follows,              // All follow lists
  followsByPubkey,      // Map<pubkey, PublishedList>
  deriveFollows,        // Get follows for pubkey
  loadFollows,          // Force follows load
  userFollows,          // Current user's follows
  
  mutes,                // All mute lists
  mutesByPubkey,        // Map<pubkey, PublishedList>
  deriveMutes,          // Get mutes for pubkey
  loadMutes,            // Force mutes load
  userMutes            // Current user's mutes
} from '@welshman/client'
```

### Relay Stores

```typescript
import {
  relays,                       // All relay info
  relaysByUrl,                  // Map<url, Relay>
  relaysByPubkey,              // Map<pubkey, Relay[]> 
  deriveRelay,                 // Get relay store
  loadRelay,                   // Force relay load
  
  relaySelections,             // All relay selections
  relaySelectionsByPubkey,     // Map<pubkey, PublishedList>
  deriveRelaySelections,       // Get selections for pubkey
  loadRelaySelections,         // Force selections load
  userRelaySelections         // Current user's selections
} from '@welshman/client'

// Types
type Relay = {
  url: string
  stats?: RelayStats
  profile?: RelayProfile
}
```

### Handle & Zapper Stores

```typescript
import {
  handles,              // All NIP-05 handles
  handlesByNip05,       // Map<nip05, Handle>
  deriveHandle,         // Get handle store
  loadHandle,           // Force handle load
  
  zappers,              // All zapper info
  zappersByLnurl,       // Map<lnurl, Zapper>
  deriveZapper,         // Get zapper store
  loadZapper           // Force zapper load
} from '@welshman/client'

// Types
type Handle = {
  nip05: string
  pubkey?: string
  nip46?: string[]
  relays?: string[]
}

type Zapper = {
  lnurl: string
  callback: string
  minSendable: number
  maxSendable: number
  metadata: string
}
```

## Filter Types

```typescript
type Filter = {
  ids?: string[]
  authors?: string[]
  kinds?: number[]
  since?: number
  until?: number
  limit?: number
  search?: string
  [key: `#${string}`]: string[]
}

type RelaysAndFilters = {
  relays?: string[]
  filters?: Filter[]
}

type RequestItem = {
  relays?: string[]
  filters?: Filter[]
}
```

## Tag Helper Functions

```typescript
import {
  tagZapSplit,    // Create zap split tag
  tagPubkey,      // Create pubkey reference tag
  tagEvent,       // Create event reference tag
  tagReplyTo,     // Create reply tags
  tagReactionTo  // Create reaction tags
} from '@welshman/client'

// Example usage
const tags = [
  ...tagPubkey(pubkey),
  ...tagEvent(parentEvent, "reply"),
  ...tagZapSplit(zapPubkey, 0.1)
]
```

## Session Types

```typescript
type SessionNip01 = {
  method: 'nip01'
  pubkey: string
  secret: string
}

type SessionNip07 = {
  method: 'nip07'
  pubkey: string
}

type SessionNip46 = {
  method: 'nip46'
  pubkey: string
  secret: string
  handler: {
    pubkey: string
    relays: string[]
  }
}

type SessionNip55 = {
  method: 'nip55'
  pubkey: string
  signer: string
}

type SessionPubkey = {
  method: 'pubkey'
  pubkey: string
}

type Session = SessionNip01 | SessionNip07 | SessionNip46 | SessionNip55 | SessionPubkey
```

## Feed Compilation Types

```typescript
import { FeedType } from '@welshman/client'

// Feed Types and Constructors
type AddressFeed = [type: FeedType.Address, ...addresses: string[]]
type AuthorFeed = [type: FeedType.Author, ...pubkeys: string[]]
type IDFeed = [type: FeedType.ID, ...ids: string[]]
type KindFeed = [type: FeedType.Kind, ...kinds: number[]]
type TagFeed = [type: FeedType.Tag, key: string, ...values: string[]]

type CreatedAtFeed = [type: FeedType.CreatedAt, ...items: CreatedAtItem[]]
type CreatedAtItem = {
  since?: number
  until?: number
  relative?: string[]
}

type WOTFeed = [type: FeedType.WOT, ...items: WOTItem[]]
type WOTItem = {
  min?: number
  max?: number
}

// DVM Feed Types
type DVMFeed = [type: FeedType.DVM, ...items: DVMItem[]]
type DVMItem = {
  kind: number
  tags?: string[][]
  relays?: string[]
  mappings?: TagFeedMapping[]
}

// List Feed Types
type ListFeed = [type: FeedType.List, ...items: ListItem[]]
type ListItem = {
  addresses: string[]
  mappings?: TagFeedMapping[]
}

// Label Feed Types
type LabelFeed = [type: FeedType.Label, ...items: LabelItem[]]
type LabelItem = {
  relays?: string[]
  authors?: string[]
  [key: `#${string}`]: string[]
  mappings?: TagFeedMapping[]
}

// Compound Feed Types
type IntersectionFeed = [type: FeedType.Intersection, ...feeds: Feed[]]
type UnionFeed = [type: FeedType.Union, ...feeds: Feed[]]
type DifferenceFeed = [type: FeedType.Difference, ...feeds: Feed[]]
```

## Router Configuration

```typescript
import { Router, RouterScenario, Selection } from '@welshman/client'

type RouterOptions = {
  getUserPubkey?: () => string | null
  getPubkeyRelays?: (pubkey: string, mode?: RelayMode) => string[]
  getFallbackRelays: () => string[]
  getIndexerRelays?: () => string[]
  getSearchRelays?: () => string[]
  getRelayQuality?: (url: string) => number
  getLimit?: () => number
}

enum RelayMode {
  Read = "read",
  Write = "write",
  Inbox = "inbox"
}

type Selection = {
  weight: number
  relays: string[]
}

type RouterScenarioOptions = {
  policy?: FallbackPolicy
  limit?: number
}

type FallbackPolicy = (count: number, limit: number) => number
```

## Event Transformation

```typescript
import { 
  asDecryptedEvent,
  readList,
  readProfile
} from '@welshman/client'

// Event transformations
type EventToItem<T> = (event: TrustedEvent) => Maybe<T | T[] | Promise<T | T[]>>
type ItemToEvent<T> = (item: T) => TrustedEvent

// Event mapping options
type DeriveEventsMappedOptions<T> = {
  filters: Filter[]
  eventToItem: EventToItem<T>
  itemToEvent: ItemToEvent<T>
  throttle?: number
  includeDeleted?: boolean
}

// Usage with derived stores
const customEvents = deriveEventsMapped(repository, {
  filters: [{kinds: [kind]}],
  eventToItem: async (event) => {
    const content = await ensurePlaintext(event)
    return readList(asDecryptedEvent(event, {content}))
  },
  itemToEvent: (item) => item.event
})
```

## Storage Adapter Configuration

```typescript
import { storageAdapters } from '@welshman/client'

type StorageAdapterOptions = {
  throttle?: number
  migrate?: (items: any[]) => any[]
}

type IndexedDbAdapter = {
  keyPath: string
  store: Writable<any[]>
}

// Available adapters
const adapters = {
  // For object stores (Record<string, T>)
  fromObjectStore: <T>(
    store: Writable<Record<string, T>>, 
    options: StorageAdapterOptions
  ) => IndexedDbAdapter

  // For map stores (Map<string, T>)
  fromMapStore: <T>(
    store: Writable<Map<string, T>>,
    options: StorageAdapterOptions
  ) => IndexedDbAdapter

  // For event tracking
  fromTracker: (
    tracker: Tracker,
    options: StorageAdapterOptions
  ) => IndexedDbAdapter

  // For event repository
  fromRepository: (
    repository: Repository,
    options: StorageAdapterOptions
  ) => IndexedDbAdapter
}
```

## Collection Configuration

```typescript
type CollectionConfig<T, LoadArgs extends any[]> = {
  // Collection name for caching
  name: string
  
  // Base store of items
  store: Readable<T[]>
  
  // How to get unique key from item
  getKey: (item: T) => string
  
  // Optional loader function
  load?: (key: string, ...args: LoadArgs) => Promise<any>
}

// Collection features:
// - Automatic stale data detection
// - Exponential backoff for failed loads 
// - Request deduplication
// - Batched loading
// - IndexedDB persistence
```

## Event Types & Structures

```typescript
import { TrustedEvent, StampedEvent, SignedEvent } from '@welshman/client'

// Basic event structure
type TrustedEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig?: string
}

// Publishing chain
type ThunkEvent = EventTemplate | StampedEvent | OwnedEvent | TrustedEvent

// Event publish request
type ThunkRequest = {
  event: ThunkEvent
  relays: string[]
  delay?: number
}

// Event status tracking
type ThunkStatus = {
  message: string
  status: PublishStatus
}

enum PublishStatus {
  Pending,
  Success,
  Failure,
  Timeout,
  Aborted
}
```

## Subscription Options

```typescript
import { subscribe, SubscriptionEvent } from '@welshman/client'

type SubscribeRequestWithHandlers = {
  filters: Filter[]
  relays?: string[]
  closeOnEose?: boolean
  timeout?: number
  onEvent?: (event: TrustedEvent) => void
  onComplete?: () => void
}

// Subscription events
enum SubscriptionEvent {
  Event = "event",
  Complete = "complete",
  Error = "error"
}

// Request options
type RequestOpts = {
  relays?: string[]
  filters: Filter[]
  onEvent: (event: TrustedEvent) => void
}

// DVM options
type DVMOpts = {
  kind: number
  tags?: string[][]
  relays?: string[]
  onEvent: (event: TrustedEvent) => void
}
```

## Network Context

```typescript
type NetContext = {
  // Event signing
  signEvent: (event: StampedEvent) => Promise<SignedEvent>
  
  // Event handling
  onEvent: (url: string, event: TrustedEvent) => void
  
  // Deletion checking
  isDeleted: (url: string, event: TrustedEvent) => boolean
  
  // Subscription optimization
  optimizeSubscriptions: (subs: Subscription[]) => RelaysAndFilters[]
}

// App context
type AppContext = {
  router: Router
  requestDelay: number
  authTimeout: number
  requestTimeout: number
  dufflepudUrl?: string
  indexerRelays?: string[]
}
```

## Web of Trust Types

```typescript
import { 
  wotGraph,
  maxWot,
  getWotScore,
  getFollowsWhoFollow,
  getFollowsWhoMute
} from '@welshman/client'

// WOT Graph store
type WotGraph = Map<string, number>

// Score calculation methods
const getWotScore = (pubkey: string, target: string): number
const getUserWotScore = (tpk: string): number
const deriveUserWotScore = (tpk: string): Readable<number>

// Network analysis
const getFollows = (pubkey: string): string[]
const getMutes = (pubkey: string): string[]
const getNetwork = (pubkey: string): string[]
const getFollowers = (pubkey: string): string[]
const getMuters = (pubkey: string): string[]
```

## Freshness Management

```typescript
type FreshnessUpdate = {
  ns: string      // Namespace
  key: string     // Item key
  ts: number      // Timestamp
}

// Immediate update
const setFreshnessImmediate = (update: FreshnessUpdate): void

// Batched update (100ms window)
const setFreshnessThrottled = (update: FreshnessUpdate): void

// Get current freshness
const getFreshness = (ns: string, key: string): number
```

## Relay Statistics Types

```typescript
type Connection = {
  url: string
  state: ConnectionState
}

type Message = [string, ...unknown[]]

enum ConnectionEvent {
  Open = "open",
  Close = "close",
  Send = "send",
  Receive = "receive",
  Error = "error"
}

// Relay quality assessment
const getRelayQuality = (url: string): number => {
  const relay = relaysByUrl.get().get(url)
  
  // Quality factors:
  // - Recent errors (5s window)
  // - Error frequency (minute/hour/day)
  // - Connection stability
  // - Response times
  // Returns 0-1 score
}
```

## Essential Utilities

### Event Construction

```typescript
import { createEvent, tagEvent, tagPubkey } from '@welshman/client'

// Common event tags
const tags = [
  ...tagPubkey(pubkey),              // Reference user
  ...tagEvent(event, "reply"),       // Reference event
  ...tagReplyTo(parentEvent),        // Full reply structure
  ...tagReactionTo(parentEvent)      // Reaction structure
]

// Event encryption
const encrypted = await nip44EncryptToSelf(content)
```

### Store Updates

```typescript
// Track events
repository.publish(event)
repository.removeEvent(eventId)

// Session management
addSession(session)
updateSession(pubkey, session => modifiedSession)
dropSession(pubkey)

// Manual collection refresh
await loadProfile(pubkey)
await loadFollows(pubkey)
await loadRelaySelections(pubkey)
```

## Quick Reference

Common operations you'll use most often:

```typescript
// Publishing
const thunk = await publishThunk({
  event,
  relays: router.PublishEvent(event).getUrls()
})

// Subscribing
const sub = subscribe({
  filters: [{ kinds: [1], authors: [pubkey] }],
  onEvent: event => console.log(event)
})

// Profiles & Relations
const profile = deriveProfile(pubkey)
const follows = deriveFollows(pubkey)
const wot = getWotScore(pubkey)

// Relay Management
const relays = router.ForUser().getUrls()
await sync({ relays, filters })
```
