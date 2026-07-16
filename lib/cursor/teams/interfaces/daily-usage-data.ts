export interface GetCursorDailyUsageDataOptions {
  startDate: number
  endDate: number
  signal?: AbortSignal
}

export interface CursorDailyUsageDataItem {
  date: number
  isActive: boolean
  totalLinesAdded: number
  totalLinesDeleted: number
  acceptedLinesAdded: number
  acceptedLinesDeleted: number
  totalApplies: number
  totalAccepts: number
  totalRejects: number
  totalTabsShown: number
  totalTabsAccepted: number
  composerRequests: number
  chatRequests: number
  agentRequests: number
  cmdkUsages: number
  subscriptionIncludedReqs: number
  apiKeyReqs: number
  usageBasedReqs: number
  bugbotUsages: number
  mostUsedModel: string
  applyMostUsedExtension?: string
  tabMostUsedExtension?: string
  clientVersion?: string
  email?: string
}

export interface CursorDailyUsagePeriod {
  startDate: number
  endDate: number
}

export interface GetCursorDailyUsageDataResponse {
  data: CursorDailyUsageDataItem[]
  period: CursorDailyUsagePeriod
}
