import type { AnthropicAdminClient } from "../client"
import { UsageReport } from "./usage-report"
import type { GetCostReportOptions, CostReportTimeBucket } from "./interfaces"
import { AnthropicAPIResponse } from "../interfaces"

export class Organizations {
  private readonly client: AnthropicAdminClient
  public readonly usageReport: UsageReport

  constructor(client: AnthropicAdminClient) {
    this.client = client
    this.usageReport = new UsageReport(client)
  }

  async costReport(params: GetCostReportOptions): Promise<AnthropicAPIResponse<CostReportTimeBucket>> {
    const url = new URL("https://api.anthropic.com/v1/organizations/cost_report")

    url.searchParams.set("starting_at", params.startingAt)

    if (params.endingAt) {
      url.searchParams.set("ending_at", params.endingAt)
    }

    if (params.limit !== undefined) {
      url.searchParams.set("limit", String(params.limit))
    }

    if (params.page) {
      url.searchParams.set("page", params.page)
    }

    if (params.groupBy) {
      for (const group of params.groupBy) {
        url.searchParams.append("group_by[]", group)
      }
    }

    if (params.bucketWidth) {
      url.searchParams.set("bucket_width", params.bucketWidth)
    }

    return this.client.get(url, params.signal)
  }
}
