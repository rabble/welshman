# @welshman/feeds [![version](https://badgen.feeds/npm/v/@welshman/feeds)](https://npmjs.com/package/@welshman/feeds)

A custom feed compiler and loader for nostr. Read the spec on [wikifreedia](https://wikifreedia.xyz/cip-01/97c70a44366a6535c1).

## Example

```javascript
// Define a feed using set operations
const feed = intersectionFeed(
  unionFeed(
    dvmFeed({
      kind: 5300,
      pubkey: '19b78ccfa7c5e31e6bacbb3f2a1703f64b62017702e584440bf29a7e16263e8c',
    }),
    listFeed("10003:19ba654f26afd4930fd3d51baf4e26f1413b7aeec7190cd6c0cdf4d2f14cec6b:"),
  )
  wotFeed({min: 0.1}),
  scopeFeed("global"),
)

// Create a controller
const controller = new FeedController({
  feed,
  request,
  requestDVM,
  getPubkeysForScope,
  getPubkeysForWOTRange,
  onEvent: event => console.log("Event", event),
  onExhausted: () => console.log("Exhausted"),
})

// Load notes using the feed
controller.load(10)
```

## Feed Types

```typescript
enum FeedType {
  Address,      // naddr1... references
  Author,       // Specific pubkeys
  CreatedAt,    // Time-based filters
  DVM,          // DVM request results
  Difference,   // Set difference operation
  ID,           // Event IDs
  Intersection, // Set intersection operation
  Global,       // Global feed
  Kind,         // Event kinds
  List,         // List-based feeds
  Label,        // NIP-32 labeling system
  WOT,          // Web of Trust ranges
  Relay,        // Specific relays
  Scope,        // Contextual scopes
  Search,       // Text search
  Tag,          // Generic tag filtering
  Union         // Set union operation
}
```

## Feed Composition

Create feeds using the provided factory functions:

```typescript
// Basic filters
const authors = makeAuthorFeed("pubkey1", "pubkey2")
const kinds = makeKindFeed(1, 6)
const tags = makeTagFeed("#t", "nostr", "programming")
const timeRange = makeCreatedAtFeed({ 
  since: 1234567890,
  until: 1234567899,
  relative: ["since"] // Use relative time
})

// Set operations
const combined = makeUnionFeed(authors, kinds)
const filtered = makeIntersectionFeed(combined, tags)
const excluded = makeDifferenceFeed(filtered, timeRange)
```

## Advanced Features

### DVM Integration

```typescript
const dvmFeed = makeDVMFeed({
  kind: 5300,
  tags: [["t", "music"]],
  relays: ["wss://relay.example.com"],
  mappings: [
    ["e", [FeedType.ID]],       // Map e tags to event IDs
    ["p", [FeedType.Author]]    // Map p tags to authors
  ]
})
```

### List Processing

```typescript
const listFeed = makeListFeed({
  addresses: ["note1...", "naddr1..."],
  mappings: [
    ["t", [FeedType.Tag, "#t"]] // Map t tags to hashtags
  ]
})
```

### Label System Support

```typescript
const labelFeed = makeLabelFeed({
  relays: ["wss://relay.example.com"],
  authors: ["pubkey1"],
  "#t": ["tag1", "tag2"],
  mappings: [/* tag mappings */]
})
```

## Feed Controller

The FeedController handles feed compilation and event loading:

```typescript
type FeedOptions = {
  feed: Feed                    // Feed definition
  request: (opts: RequestOpts) => Promise<void>  // Event fetching
  requestDVM: (opts: DVMOpts) => Promise<void>   // DVM interaction
  getPubkeysForScope: (scope: Scope) => string[] // Scope resolution
  getPubkeysForWOTRange: (min: number, max: number) => string[] // WOT lookup
  onEvent?: (event: TrustedEvent) => void        // Event handler
  onExhausted?: () => void                       // Feed exhaustion handler
  useWindowing?: boolean                         // Enable time windowing
}
```

### Time Windowing

The controller supports smart time windowing for efficient event loading:
- Automatically adjusts window size based on event density
- Handles sparse data with exponential backoff
- Maintains chronological order of events

### Set Operations

The controller efficiently handles set operations:
- Union: Combines multiple feeds, deduplicating events
- Intersection: Finds events common to all feeds
- Difference: Excludes events from one feed from another

## Utility Functions

```typescript
// Convert tags to feeds
const feeds = feedsFromTags(tags, mappings)
const feed = feedFromTags(tags, mappings)

// Convert filters to feeds
const feeds = feedsFromFilter(filter)
const feed = feedFromFilter(filter)
const feeds = feedsFromFilters(filters)

// Walk feed structure
walkFeed(feed, visitFn)
```

## Feature Notes

- Automatic filter optimization and merging
- Efficient relay query distribution
- Handles both sync and async event processing
- Supports NIP-32 label system
- Extensible tag mapping system
- Built-in request deduplication
- Smart exhaustion detection

## Dependencies

- @welshman/lib: Core utilities
- @welshman/util: Nostr utilities
- @welshman/net: Network operations
