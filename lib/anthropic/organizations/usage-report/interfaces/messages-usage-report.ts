import type { MessagesUsageReportContextWindow } from "../../interfaces/cost-report"

export type UsageReportServiceTier = "standard" | "batch" | "priority"

export type MessagesUsageReportGroupBy = "api_key_id" | "workspace_id" | "model" | "service_tier" | "context_window"

export type MessagesUsageReportTimeBucketWidth = "1d" | "1h" | "1m"

export interface CacheCreationBreakdown {
  ephemeral1hInputTokens: number
  ephemeral5mInputTokens: number
}

export interface MessagesUsageReportServerToolUse {
  webSearchRequests: number
}

export interface MessagesUsageReportItem {
  uncachedInputTokens: number
  cacheCreation: CacheCreationBreakdown
  cacheReadInputTokens: number
  outputTokens: number
  serverToolUse: MessagesUsageReportServerToolUse
  apiKeyId: string | null
  workspaceId: string | null
  model: string | null
  serviceTier: UsageReportServiceTier | null
  contextWindow: MessagesUsageReportContextWindow | null
}

export interface MessagesUsageReportTimeBucket {
  startingAt: string
  endingAt: string
  results: MessagesUsageReportItem[]
}
