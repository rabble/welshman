# @welshman/dvm [![version](https://badgen.npm/v/@welshman/dvm)](https://npmjs.com/package/@welshman/dvm)

Utilities for building nostr DVMs (Decentralized Virtual Machines).

## Request Example

```javascript
import type {Publish, Subscription} from '@welshman/net'
import {makeDvmRequest, DVMEvent} from '@welshman/dvm'

const req = makeDvmRequest({
  // Create and sign a dvm request event, including any desired tags
  event: createAndSign({kind: 5300}),
  // Publish and subscribe to these relays
  relays: ['wss://relay.damus.io', 'wss://dvms.f7z.io'],
  // Timeout defaults to 30 seconds
  timeout: 30_000,
  // Auto close on first result (defaults to true)
  autoClose: true,
  // Listen for and emit `progress` events
  reportProgress: true,
})

// Listen for progress, result, etc
req.emitter.on(DVMEvent.Progress, (url, event) => console.log(event))
req.emitter.on(DVMEvent.Result, (url, event) => console.log(event))
```

## Handler Example

```javascript
const {bytesToHex} = require('@noble/hashes/utils')
const {generateSecretKey} = require('nostr-tools')
const {createEvent} = require('@welshman/util')
const {subscribe} = require('@welshman/net')
const {DVM} = require('@welshman/dvm')

// Your DVM's private key. Store this somewhere safe
// const hexPrivateKey = bytesToHex(generateSecretKey())
const hexPrivateKey = '9cd387a3aa0c1abc2ef517c8402f29c069b4174e02a426491aec7566501bee67'

// Tags that we'll return as content discovery suggestions
const tags = []

// Populate the tags with music by Ainsley Costello
const sub = subscribe({
  timeout: 30_000,
  relays: ["wss://relay.wavlake.com"],
  filters: [{
    kinds: [31337],
    '#p': ['8806372af51515bf4aef807291b96487ea1826c966a5596bca86697b5d8b23bc'],
  }],
})

// Push event ids to our suggestions
sub.emitter.on('event', (url, e) => tags.push(["e", e.id, url]))

const dvm = new DVM({
  // The private key used to sign events
  sk: hexPrivateKey,
  // Relays that the DVM will listen on
  relays: ['wss://relay.damus.io', 'wss://dvms.f7z.io'],
  // Only listen to requests tagging our dvm
  requireMention: true,
  // Expire results after 1 hour (the default)
  expireAfter: 60 * 60,
  // Handlers for various kinds
  handlers: {
    5300: dvm => ({
      handleEvent: async function* (event) {
        // DVM responses are stringified into the content
        const content = JSON.stringify(tags)

        // Yield our response. Kind 7000 can be used for partial results too
        yield createEvent(event.kind + 1000, {content})
      },
    }),
  }
})

// Enable logging
dvm.logEvents = true

// When you're ready
dvm.start()

// When you're done
dvm.stop()
```

## Additional Features

### DVM Request Options

```typescript
type DVMRequestOptions = {
  event: SignedEvent        // The DVM request event
  relays: string[]         // Relays to publish/subscribe to
  timeout?: number         // Request timeout (default: 30s)
  autoClose?: boolean      // Close after first result (default: true)
  reportProgress?: boolean // Listen for progress events (default: true)
}
```

### Event Types

```typescript
enum DVMEvent {
  Progress = "progress", // Kind 7000 events
  Result = "result"     // Kind x+1000 events
}
```

### DVM Handler Configuration

```typescript
type DVMOpts = {
  sk: string                                    // Private key in hex
  relays: string[]                             // Relays to listen on
  handlers: Record<string, CreateDVMHandler>    // Kind-specific handlers
  expireAfter?: number                         // Result expiration (default: 1h)
  requireMention?: boolean                     // Require p-tag mention
}

type DVMHandler = {
  stop?: () => void                           // Optional cleanup
  handleEvent: (e: TrustedEvent) => AsyncGenerator<StampedEvent>
}
```

### Automatic Response Tags

The DVM automatically adds these tags to response events:
- `["request", JSON.stringify(request)]` - Original request
- `["i", ...]` - Input tag if present in request
- `["p", pubkey]` - Requestor's pubkey
- `["e", id]` - Request event ID
- `["expiration", timestamp]` - Expiration time if configured

## Features

- 🤖 Easy DVM request and handler creation
- 🔄 Async generator-based response handling
- 📊 Progress event support (kind 7000)
- ⚡️ Automatic tag management
- 🔒 Built-in request validation
- ⏰ Configurable timeouts and expiration
- 📝 Optional event logging

## Dependencies

- nostr-tools: Event signing and key operations
- @noble/hashes: Cryptographic utilities
- @welshman/net: Relay communication
- @welshman/util: Event utilities
- @welshman/lib: Common utilities
