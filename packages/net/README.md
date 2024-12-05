@welshman/net 

A powerful suite of utilities for managing connections and working with Nostr messages. Whether you’re building relay-based applications or handling event streams, this library provides the tools you need.

Installation

Install via npm:

npm install @welshman/net

Getting Started

Here’s a quick guide to help you get started.

Importing the Library

const {
  Connection,
  ConnectionAuth,
  ConnectionSender,
  ConnectionState,
  ConnectionStats,
  Context,
  Executor,
  Pool,
  Publish,
  Socket,
  Subscribe,
  Tracker,
} = require('@welshman/net');

Setting Up a Connection

const connection = new Connection('wss://example-relay.nostr.com');
connection.open();

API Documentation

Connection

Manages WebSocket connections to Nostr relays.
	•	open(): Opens a WebSocket connection.
	•	close(): Closes the connection.
	•	send(data): Sends a message to the relay.

ConnectionAuth

Tracks authentication status for a connection.
	•	isAuthenticated: Returns true if authenticated.
	•	authenticate(credentials): Authenticates the connection.

ConnectionSender

Implements a send queue for a connection to ensure efficient message delivery.
	•	queueMessage(message): Adds a message to the send queue.
	•	flushQueue(): Sends all messages in the queue.

ConnectionState

Tracks pending publish requests and relay-specific connection states.
	•	getPending(): Retrieves pending operations.
	•	addPending(request): Adds a pending request.

ConnectionStats

Gathers and tracks timing, error, and performance statistics for connections.
	•	getStats(): Returns statistics data.
	•	reset(): Clears all tracked statistics.

Context

Provides a default configuration for the library.
	•	getDefaultContext(): Returns the default context configuration.
	•	updateContext(settings): Updates the context settings.

Executor

Executes Nostr-specific workflows on a given target.
	•	execute(command): Executes a predefined command or workflow.
	•	getResults(): Fetches the results of the workflow.

Pool

A simple wrapper around Map to manage multiple connections.
	•	add(key, connection): Adds a connection.
	•	get(key): Retrieves a connection.
	•	remove(key): Removes a connection.

Publish

Contains utilities for creating and publishing events.
	•	createEvent(data): Constructs a new event.
	•	publishEvent(event): Publishes the event to relays.

Socket

A wrapper around WebSocket for JSON parsing and serialization.
	•	connect(url): Connects to the specified WebSocket URL.
	•	disconnect(): Disconnects from the WebSocket.

Subscribe

Provides utilities for subscribing to events from Nostr relays.
	•	subscribe(filters): Sets up a subscription with specified filters.
	•	unsubscribe(): Cancels all active subscriptions.

Tracker

Tracks which relays have seen a given event.
	•	track(event): Tracks a specific event.
	•	getTrackedEvents(): Retrieves a list of tracked events.

Usage Examples

Example: Publish an Event

const { Connection, Publish } = require('@welshman/net');

const connection = new Connection('wss://relay.nostr.com');
connection.open();

const event = Publish.createEvent({
  kind: 1,
  content: 'Hello, Nostr!',
  tags: [],
});

Publish.publishEvent(connection, event);

Example: Subscribe to Events

const { Connection, Subscribe } = require('@welshman/net');

const connection = new Connection('wss://relay.nostr.com');
connection.open();

Subscribe.subscribe(connection, [{ kinds: [1] }]);
connection.on('event', (event) => {
  console.log('Received event:', event);
});

Contributing

We welcome contributions! To get started:
	1.	Fork the repository.
	2.	Clone your fork.
	3.	Make changes and test thoroughly.
	4.	Submit a pull request with a detailed description of your changes.

License

This project is licensed under the MIT License. See the LICENSE file for details.

Would you like me to refine this further or focus on any specific section?