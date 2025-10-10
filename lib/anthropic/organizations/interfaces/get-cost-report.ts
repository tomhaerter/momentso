import type { CostReportGroupBy } from "./cost-report"

export interface GetCostReportOptions {
  /**
   * Time buckets that start on or after this RFC 3339 timestamp will be returned.
   */
  startingAt: string
  /**
   * Time buckets that end before this RFC 3339 timestamp will be returned.
   */
  endingAt?: string | null
  /**
   * Maximum number of time buckets to return in the response (default: 7, max: 31).
   */
  limit?: number
  /**
   * Opaque cursor token from previous response's `next_page` field.
   */
  page?: string | null
  /**
   * Group by any subset of the available options.
   */
  groupBy?: CostReportGroupBy[] | null
  /**
   * Time granularity of the response data. Currently only `1d` is supported.
   */
  bucketWidth?: "1d"
  /**
   * Optional abort signal for cancelling the request.
   */
  signal?: AbortSignal
}
