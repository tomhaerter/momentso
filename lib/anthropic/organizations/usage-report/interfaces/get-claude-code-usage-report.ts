export interface GetClaudeCodeUsageReportOptions {
  /**
   * UTC date in YYYY-MM-DD format. Returns metrics for this single day only.
   */
  startingAt: string
  /**
   * Number of records per page (default: 20, max: 1000).
   */
  limit?: number
  /**
   * Opaque cursor token from previous response's `next_page` field.
   */
  page?: string | null
  /**
   * Optional abort signal for cancelling the request.
   */
  signal?: AbortSignal
}
