# @welshman/signer

Multi-protocol Nostr signer library supporting NIP-01, NIP-07, NIP-46, NIP-55, and event wrapping (NIP-59).

## Features

- 🔐 Private key (NIP-01) signing
- 🔌 Browser extension (NIP-07) integration
- 🌐 Remote signer (NIP-46) support 
- 📱 Mobile signer (NIP-55) integration
- 🎁 Event wrapping (NIP-59) implementation
- 🔒 NIP-04 & NIP-44 encryption

## Basic Usage

### Private Key Signing (NIP-01)

```typescript
import { Nip01Signer, makeSecret } from '@welshman/signer'

// Create with existing secret
const signer = new Nip01Signer(hexSecret)

// Generate new keypair
const signer = Nip01Signer.fromSecret(makeSecret())

// Create ephemeral signer
const signer = Nip01Signer.ephemeral()

// Sign event
const signed = await signer.sign(event)

// Encrypt messages
const encrypted = await signer.nip44.encrypt(pubkey, message)
const decrypted = await signer.nip44.decrypt(pubkey, message)
```

### Browser Extension (NIP-07)

```typescript
import { Nip07Signer } from '@welshman/signer'

const signer = new Nip07Signer()

// Use extension for signing
await signer.sign(event)

// Use extension for encryption
await signer.nip04.encrypt(pubkey, message)
await signer.nip44.encrypt(pubkey, message) 
```

### Remote Signing (NIP-46) 

```typescript
import { Nip46Signer, Nip46Broker } from '@welshman/signer'

// Create broker connection
const broker = Nip46Broker.get({
  relays: ['wss://relay.example.com'],
  clientSecret: clientSecret,
  signerPubkey: signerPubkey
})

// Create signer
const signer = new Nip46Signer(broker)

// Connect to remote signer
await broker.connect(signerPubkey, connectSecret, permissions)

// Use remote signer
await signer.sign(event)
```

### Mobile Signing (NIP-55)

```typescript
import { Nip55Signer, getNip55 } from '@welshman/signer'

// Get available signers
const apps = await getNip55()

// Create signer for specific app
const signer = new Nip55Signer(packageName)

// Use mobile signer
await signer.sign(event)
```

## Event Wrapping (NIP-59)

```typescript
import { Nip59, wrap, unwrap } from '@welshman/signer'

// Create wrapper
const nip59 = new Nip59(signer)

// Wrap event 
const wrapped = await nip59.wrap(recipientPubkey, event)

// Unwrap event
const unwrapped = await nip59.unwrap(wrapped)

// With custom wrapper signer
const nip59 = new Nip59(signer, wrapperSigner)
```

## Signer Interface

All signers implement the `ISigner` interface:

```typescript
interface ISigner {
  // Get pubkey
  getPubkey: () => Promise<string>
  
  // Sign event
  sign: (event: StampedEvent) => Promise<SignedEvent>
  
  // NIP-04 encryption
  nip04: {
    encrypt: (pubkey: string, message: string) => Promise<string>
    decrypt: (pubkey: string, message: string) => Promise<string>
  }
  
  // NIP-44 encryption
  nip44: {
    encrypt: (pubkey: string, message: string) => Promise<string>
    decrypt: (pubkey: string, message: string) => Promise<string>
  }
}
```

## Utilities

```typescript
import { 
  makeSecret,     // Generate private key
  getPubkey,      // Get pubkey from secret
  stamp,          // Add timestamp to event
  own,           // Add pubkey to event
  hash,          // Add hash to event
  sign           // Add signature to event
} from '@welshman/signer'

// Event transformation chain
const event = sign(hash(own(stamp(template), pubkey)), secret)
```

## Dependencies

- @noble/curves: Cryptographic operations
- nostr-tools: Core Nostr functionality
- @welshman/lib: Utility functions
- @welshman/util: Nostr utilities

## License

[Add license information]

For complete API reference, see the TypeScript definitions included in the package.