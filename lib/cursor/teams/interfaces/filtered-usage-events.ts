export interface GetCursorFilteredUsageEventsOptions {
  startDate?: number
  endDate?: number
  userId?: number
  page?: number
  pageSize?: number
  email?: string
  signal?: AbortSignal
}

export interface CursorUsageEventTokenUsage {
  inputTokens: number
  outputTokens: number
  cacheWriteTokens: number
  cacheReadTokens: number
  totalCents: number
}

export interface CursorUsageEvent {
  timestamp: string
  model: string
  kind: string
  maxMode: boolean
  requestsCosts: number
  isTokenBasedCall: boolean
  tokenUsage?: CursorUsageEventTokenUsage
  isFreeBugbot: boolean
  userEmail: string
}

export interface CursorUsageEventsPagination {
  numPages: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CursorUsageEventsPeriod {
  startDate: number
  endDate: number
}

export interface GetCursorFilteredUsageEventsResponse {
  totalUsageEventsCount: number
  pagination: CursorUsageEventsPagination
  usageEvents: CursorUsageEvent[]
  period: CursorUsageEventsPeriod
}
