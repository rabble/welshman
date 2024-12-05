# @welshman/content [![version](https://badgen.net/npm/v/@welshman/content)](https://npmjs.com/package/@welshman/content)

Utilities for parsing and rendering Nostr content with safe HTML output and comprehensive format support.

```typescript
import {parse, render} from '@welshman/content'

const content = "Hello<br>from https://coracle.tools! <script>alert('evil')</script>"
const html = parse({content}).map(render).join("")
// => Hello&lt;br&gt;from <a href="https://coracle.tools/" target="_blank">coracle.tools/</a>! &lt;script&gt;alert('evil')&lt;/script&gt;
```

## Features

- 🔍 Parses Nostr-specific formats (naddr, nevent, nprofile)
- 💰 Recognizes Lightning invoices and Cashu tokens
- 🔗 Smart URL detection with XSS protection
- 📝 Markdown-style code blocks and inline code
- #️⃣ Topic/hashtag parsing
- 👤 Legacy mention format support (#[0])
- 🎯 Content truncation with smart length handling

## Installation

```bash
npm install @welshman/content
```

## Basic Usage

### Parse and Render Content

```typescript
import { parse, render } from '@welshman/content'

// Parse content and tags from a Nostr note
const parsed = parse({ 
  content: "Check out nostr:npub1...", 
  tags: [] // Nostr event tags
})

// Render to safe HTML
const html = parsed.map(segment => render(segment, {
  entityBaseUrl: 'https://njump.me/' // Optional
})).join('')
```

### Truncate Long Content

```typescript
import { truncate } from '@welshman/content'

const truncated = truncate(parsed, {
  minLength: 500,    // Minimum length before truncating
  maxLength: 700,    // Maximum content length
  mediaLength: 200,  // Space allocation for media
  entityLength: 30   // Space allocation for entities
})
```

## Supported Formats

The parser recognizes and safely handles:

### Nostr References
- `naddr1...` - Addressable content
- `note1...` / `nevent1...` - Notes and events
- `npub1...` / `nprofile1...` - Public keys and profiles
- Legacy `#[0]` mentions from tags
- Optional `nostr:` and `web+` prefixes

### Code & Formatting
- Multiline code blocks: ```code```
- Inline code: `code`
- Line breaks
- Topics/hashtags: #topic

### URLs & Media
- Automatic protocol addition
- Media type detection
- Metadata from URL fragments
- imeta tag support
- XSS protection

### Payment Formats
- Lightning invoices (lnbc/lnurl)
- Cashu tokens

## Type Safety

```typescript
import { ParsedType, isProfile, isEvent } from '@welshman/content'

// Type guards for parsed content
if (isProfile(segment)) {
  // segment.value is typed as ProfilePointer
}
```

## Security

Built-in security features:
- URL sanitization via @braintree/sanitize-url
- HTML content escaping
- Safe link handling
- Protected entity URL construction

## Advanced Usage

### Custom HTML Rendering

```typescript
import { HTML } from '@welshman/content'

// Safe string escaping
const safe = HTML.useSafely("<script>alert('xss')</script>")

// Build safe links
const link = HTML.buildLink("https://example.com", "Example")

// Entity links
const entity = HTML.buildEntityLink("npub1...", {
  entityBaseUrl: 'https://njump.me/'
})
```

### Type Definitions

```typescript
enum ParsedType {
  Address, Cashu, Code, Ellipsis,
  Event, Invoice, Link, Newline,
  Profile, Text, Topic
}

type ParseContext = {
  results: Parsed[]
  content: string
  tags: string[][]
}

type ParsedLinkValue = {
  url: URL
  meta: Record<string, string>
  isMedia: boolean
}
```

## Dependencies

- nostr-tools: NIP-19 encoding/decoding
- @braintree/sanitize-url: URL sanitization
