import {normalizeUrl, stripProtocol} from '@welshman/lib'

export const LOCAL_RELAY_URL = "local://welshman.relay"

export const BOGUS_RELAY_URL = "bogus://welshman.relay"

export const isShareableRelayUrl = (url: string) =>
  Boolean(
    typeof url === 'string' &&
    // Is it actually a websocket url and has a dot
    url.match(/^wss:\/\/.+\..+/) &&
    // Sometimes bugs cause multiple relays to get concatenated
    url.match(/:\/\//g)?.length === 1 &&
    // It shouldn't have any whitespace, url-encoded or otherwise
    !url.match(/\s|%/) &&
    // Don't match stuff with a port number
    !url.slice(6).match(/:\d+/) &&
    // Don't match raw ip addresses
    !url.slice(6).match(/\d+\.\d+\.\d+\.\d+/) &&
    // Skip nostr.wine's virtual relays
    !url.slice(6).match(/\/npub/)
  )

type NormalizeRelayUrlOpts = {
  allowInsecure?: boolean
}

export const normalizeRelayUrl = (url: string, {allowInsecure = false}: NormalizeRelayUrlOpts = {}) => {
  const prefix = allowInsecure ? url.match(/^wss?:\/\//)?.[0] || "wss://" : "wss://"

  // Use our library to normalize
  url = normalizeUrl(url, {stripHash: true, stripAuthentication: false})

  // Strip the protocol since only wss works, lowercase
  url = stripProtocol(url).toLowerCase()

  // Urls without pathnames are supposed to have a trailing slash
  if (!url.includes("/")) {
    url += "/"
  }

  return prefix + url
}
