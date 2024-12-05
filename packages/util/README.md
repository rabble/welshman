@welshman/util 

A collection of Nostr-specific utilities designed to be stateless and side-effect-free. This library provides tools to streamline the handling of Nostr addresses, events, filters, and more.

Installation

Install via npm:

npm install @welshman/util

Getting Started

Import the utilities you need from the package:

const {
  Address,
  Events,
  Filters,
  Kinds,
  Links,
  Relay,
  Relays,
  Router,
  Tags,
  Zaps,
} = require('@welshman/util');

Use these utilities in your Nostr-based applications to simplify common operations.

API Documentation

Address

Utilities for handling Nostr addresses.
	•	parse(address): Parses a Nostr address into its components.
	•	validate(address): Checks if a Nostr address is valid.

Events

Utilities for handling Nostr events.
	•	normalize(event): Normalizes an event for consistency.
	•	validate(event): Validates the structure of a Nostr event.
	•	sign(event, privateKey): Signs an event with the given private key.

Filters

Utilities for working with Nostr filters.
	•	applyFilter(filter, events): Applies a filter to a list of events.
	•	combine(filters): Combines multiple filters into one.

Kinds

Constants and utility functions for working with Nostr kinds.
	•	getKindName(kind): Returns the name of a kind.
	•	isValidKind(kind): Checks if a kind is valid.

Links

Utilities for encoding and decoding Nostr links.
	•	encode(data): Encodes data into a Nostr link.
	•	decode(link): Decodes a Nostr link into its components.

Relay

An in-memory implementation of a Nostr relay.
	•	start(): Starts the in-memory relay.
	•	stop(): Stops the relay.

Relays

Utilities related to relay URLs.
	•	isValidRelay(url): Checks if a relay URL is valid.
	•	normalizeRelay(url): Normalizes a relay URL for consistency.

Router

A utility for selecting relay URLs based on user preferences and protocol hints.
	•	route(hints): Selects a relay URL based on hints.
	•	addPreference(relay, weight): Adds a user preference for a relay.

Tags

Convenient methods for accessing and modifying tags.
	•	addTag(event, tag): Adds a tag to an event.
	•	getTags(event): Retrieves tags from an event.

Zaps

Utilities for handling zaps (Nostr-specific interactions).
	•	createZapRequest(details): Creates a zap request.
	•	validateZapRequest(request): Validates a zap request.

Usage Examples

Example: Validating a Nostr Address

const { Address } = require('@welshman/util');

const address = 'npub1exampleaddresshere';
if (Address.validate(address)) {
  console.log('Valid address!');
} else {
  console.log('Invalid address!');
}

Example: Normalizing an Event

const { Events } = require('@welshman/util');

const rawEvent = { id: '123', kind: 1, content: 'Hello, world!' };
const normalized = Events.normalize(rawEvent);
console.log(normalized);

Example: Encoding a Nostr Link

const { Links } = require('@welshman/util');

const link = Links.encode({ type: 'event', id: '12345' });
console.log('Encoded link:', link);

Contributing

We welcome contributions to improve and expand this utility library! To get started:
	1.	Fork the repository.
	2.	Clone your forked repository.
	3.	Make changes and ensure they are tested.
	4.	Submit a pull request with a clear description of your changes.
