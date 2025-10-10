export type CustomerType = "api" | "subscription"

export type SubscriptionType = "enterprise" | "team"

export interface ApprovalMetrics {
  accepted: number
  rejected: number
}

export interface LinesOfCode {
  added: number
  removed: number
}

export interface CoreMetrics {
  commitsByClaudeCode: number
  linesOfCode: LinesOfCode
  numSessions: number
  pullRequestsByClaudeCode: number
}

export interface TokenUsage {
  cacheCreation: number
  cacheRead: number
  input: number
  output: number
}

export interface EstimatedCost {
  amount: number
  currency: string
}

export interface ModelBreakdown {
  estimatedCost: EstimatedCost
  model: string
  tokens: TokenUsage
}

export interface ApiActor {
  apiKeyName: string
  type: "api_actor"
}

export interface UserActor {
  emailAddress: string
  type: "user_actor"
}

export type Actor = ApiActor | UserActor

export interface ClaudeCodeUsageReportItem {
  actor: Actor
  coreMetrics: CoreMetrics
  customerType: CustomerType
  date: string
  modelBreakdown: ModelBreakdown[]
  organizationId: string
  subscriptionType: SubscriptionType | null
  terminalType: string
  toolActions: Record<string, ApprovalMetrics>
}
