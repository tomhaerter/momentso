import type { MessagesUsageReportGroupBy, MessagesUsageReportTimeBucketWidth, UsageReportServiceTier } from "./messages-usage-report"
import type { MessagesUsageReportContextWindow } from "../../interfaces/cost-report"

export interface GetMessagesUsageReportOptions {
  /**
   * Time buckets that start on or after this RFC 3339 timestamp will be returned.
   */
  startingAt: string
  /**
   * Time buckets that end before this RFC 3339 timestamp will be returned.
   */
  endingAt?: string | null
  /**
   * Maximum number of time buckets to return in the response.
   */
  limit?: number
  /**
   * Opaque cursor token from previous response's `next_page` field.
   */
  page?: string | null
  /**
   * Restrict usage returned to the specified API key ID(s).
   */
  apiKeyIds?: string[] | null
  /**
   * Restrict usage returned to the specified workspace ID(s).
   */
  workspaceIds?: string[] | null
  /**
   * Restrict usage returned to the specified model(s).
   */
  models?: string[] | null
  /**
   * Restrict usage returned to the specified service tier(s).
   */
  serviceTiers?: UsageReportServiceTier[] | null
  /**
   * Restrict usage returned to the specified context window(s).
   */
  contextWindows?: MessagesUsageReportContextWindow[] | null
  /**
   * Group by any subset of the available options.
   */
  groupBy?: MessagesUsageReportGroupBy[] | null
  /**
   * Time granularity of the response data.
   */
  bucketWidth?: MessagesUsageReportTimeBucketWidth | null
  /**
   * Optional abort signal for cancelling the request.
   */
  signal?: AbortSignal
}
