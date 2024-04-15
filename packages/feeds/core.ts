
import {inc, now, isNil} from '@coracle.social/lib'
import type {Rumor, Filter} from '@coracle.social/util'
import {Tags, getIdFilters, mergeFilters} from '@coracle.social/util'

export enum FeedType {
  Difference = "\\",
  Intersection = "∩",
  SymmetricDifference = "Δ",
  Union = "∪",
  Filter = "filter",
  Relay = "relay",
  List = "list",
  LOL = "lol",
  DVM = "dvm",
}

export enum Scope {
  Self = "self",
  Global = "global",
  Follows = "follows",
  Followers = "followers",
}

export type DynamicFilter = Filter & {
  scopes?: Scope[]
  min_wot?: number
  max_wot?: number
  until_ago?: number
  since_ago?: number
}

export type RelayFeed = [FeedType.Relay, string[], ...Feed[]]
export type DifferenceFeed = [FeedType.Difference, ...Feed[]]
export type IntersectionFeed = [FeedType.Intersection, ...Feed[]]
export type SymmetricDifferenceFeed = [FeedType.SymmetricDifference, ...Feed[]]
export type UnionFeed = [FeedType.Union, ...Feed[]]
export type FilterFeed = [FeedType.Filter, ...DynamicFilter[]]
export type ListFeed = [FeedType.List, ...string[]]
export type LOLFeed = [FeedType.LOL, ...string[]]
export type DVMFeed = [FeedType.DVM, ...DVMItem[]]

export type Feed =
  RelayFeed |
  DifferenceFeed |
  IntersectionFeed |
  SymmetricDifferenceFeed |
  UnionFeed |
  FilterFeed |
  RelayFeed |
  ListFeed |
  LOLFeed |
  DVMFeed

export const relayFeed = (relays: string[], ...feeds: Feed[]) => [FeedType.Relay, relays, ...feeds] as Feed
export const differenceFeed = (...feeds: Feed[]) => [FeedType.Difference, ...feeds] as Feed
export const intersectionFeed = (...feeds: Feed[]) => [FeedType.Intersection, ...feeds] as Feed
export const symmetricDifferenceFeed = (...feeds: Feed[]) => [FeedType.SymmetricDifference, ...feeds] as Feed
export const unionFeed = (...feeds: Feed[]) => [FeedType.Union, ...feeds] as Feed
export const filterFeed = (...filters: DynamicFilter[]) => [FeedType.Filter, ...filters] as Feed
export const listFeed = (...addresses: string[]) => [FeedType.List, ...addresses] as Feed
export const lolFeed = (...addresses: string[]) => [FeedType.LOL, ...addresses] as Feed
export const dvmFeed = (...requests: DVMItem[]) => [FeedType.DVM, ...requests] as Feed

export type RequestItem = {
  relays: string[]
  filters: Filter[]
}

export type RequestOpts<E> = RequestItem & {
  onEvent: (event: E) => void
}

export type DVMItem = {
  kind: number
  tags?: string[][]
}

export type DVMOpts<E> = DVMItem & {
  onEvent: (event: E) => void
}

export type FeedOptions<E> = {
  request: (opts: RequestOpts<E>) => Promise<void>
  requestDvm: (opts: DVMOpts<E>) => Promise<void>
  getPubkeysForScope: (scope: Scope) => string[]
  getPubkeysForWotRange: (minWot: number, maxWot: number) => string[]
}