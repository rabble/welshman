# @welshman/lib

Core utility library providing fundamental building blocks for Nostr applications.

## Features

- 🛠️ Essential utilities for data manipulation and transformation
- 🚦 Batching and throttling mechanisms
- 💾 LRU caching system
- 🔄 Event handling and emitter support
- ⏳ Promise utilities including deferred promises
- 🧮 Collection manipulation tools
- 🔗 URL normalization and manipulation

## Core Utilities

### Worker System

Handle sequential processing of work items with throttling and batching:

```typescript
import { Worker } from '@welshman/lib'

const worker = new Worker<TaskType>({
  getKey: task => task.id,         // Optional key for handlers
  shouldDefer: task => !ready,     // Optional defer logic
  chunkSize: 50,                   // Items per batch (default: 50)
  delay: 50                        // Ms between batches (default: 50)
})

// Add handlers
worker.addGlobalHandler(task => {
  // Handle any task
})

worker.addHandler('key', task => {
  // Handle specific tasks
})

// Push work
worker.push(task)

// Control flow
worker.pause()
worker.resume()
worker.clear()
```

### Promise Utilities

```typescript
import { defer, type Deferred } from '@welshman/lib'

// Create deferred promise
const deferred = defer<ResultType, ErrorType>()

// Resolve/reject from outside
deferred.resolve(result)
deferred.reject(error)

// Wait for result
const result = await deferred
```

### Collection Tools

```typescript
import {
  groupBy,
  indexBy,
  partition,
  chunks,
  uniq,
  sortBy
} from '@welshman/lib'

// Group items
const grouped = groupBy(item => item.key, items)

// Index by key
const indexed = indexBy(item => item.id, items)

// Split into chunks
const batches = chunks(3, items)    // Split into 3 chunks
const chunked = chunk(5, items)     // Chunks of size 5

// Filtering
const [matching, others] = partition(predicate, items)
const unique = uniq(items)
const sorted = sortBy(item => item.score, items)
```

### Batching & Throttling

```typescript
import { batch, throttle, batcher } from '@welshman/lib'

// Batch updates
const batchedUpdate = batch(300, (updates) => {
  // Process multiple updates together
})

// Create batched function
const batchedLoader = batcher(800, async (requests) => {
  // Load multiple items at once
  return results
})

// Throttle calls
const throttled = throttle(1000, () => {
  // Called at most once per second
})
```

### Caching

```typescript
import { cached, LRUCache } from '@welshman/lib'

// Create cached function
const cachedFn = cached({
  maxSize: 1000,
  getKey: args => hash(args),
  getValue: args => expensiveOperation(args)
})

// Direct LRU cache usage
const cache = new LRUCache<KeyType, ValueType>(1000)
cache.set(key, value)
cache.get(key)
```

### URL Handling

```typescript
import { normalizeUrl } from '@welshman/lib'

const normalized = normalizeUrl(url, {
  defaultProtocol: 'https',
  stripWWW: true,
  removeQueryParameters: [/^utm_/i],
  sortQueryParameters: true
})
```

### Event Emission

```typescript
import { Emitter } from '@welshman/lib'

const emitter = new Emitter()

// Listen to specific event
emitter.on('event', handler)

// Listen to all events
emitter.on('*', (type, ...args) => {
  // Handle any event
})

// Emit event
emitter.emit('event', data)
```

## Types

```typescript
type Maybe<T> = T | undefined
type Nil = null | undefined

type CustomPromise<T, E> = Promise<T> & {
  __errorType: E
}

type Deferred<T, E = T> = CustomPromise<T, E> & {
  resolve: (arg: T) => void
  reject: (arg: E) => void
}
```

## Time Utilities

```typescript
import { now, ago, MINUTE, HOUR, DAY, WEEK } from '@welshman/lib'

// Time constants
const fiveMinutes = int(MINUTE, 5)
const oneDay = int(DAY)

// Timestamps
const timestamp = now()
const fiveMinutesAgo = ago(MINUTE, 5)
```

## License

[Add license information]

For complete API reference, see the TypeScript definitions included with the package.