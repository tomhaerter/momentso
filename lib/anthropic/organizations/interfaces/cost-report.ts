export type CostReportGroupBy = "workspace_id" | "description"

export type CostReportServiceTier = "standard" | "batch"

export type CostReportTokenType =
  | "uncached_input_tokens"
  | "output_tokens"
  | "cache_read_input_tokens"
  | "cache_creation.ephemeral_1h_input_tokens"
  | "cache_creation.ephemeral_5m_input_tokens"

export type CostType = "tokens" | "web_search" | "code_execution"

export type MessagesUsageReportContextWindow = "0-200k" | "200k-1M"

export interface CostReportItem {
  amount: string
  contextWindow: MessagesUsageReportContextWindow | null
  costType: CostType | null
  currency: string
  description: string | null
  model: string | null
  serviceTier: CostReportServiceTier | null
  tokenType: CostReportTokenType | null
  workspaceId: string | null
}

export interface CostReportTimeBucket {
  endingAt: string
  results: CostReportItem[]
  startingAt: string
}
