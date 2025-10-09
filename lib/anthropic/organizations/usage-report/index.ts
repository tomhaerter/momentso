import type { AnthropicAdminClient } from "../../client"
import type { AnthropicAPIResponse } from "../../interfaces"
import type { GetClaudeCodeUsageReportOptions, ClaudeCodeUsageReportItem, GetMessagesUsageReportOptions, MessagesUsageReportTimeBucket } from "./interfaces"

export class UsageReport {
  private readonly client: AnthropicAdminClient

  constructor(client: AnthropicAdminClient) {
    this.client = client
  }

  async claudeCode(params: GetClaudeCodeUsageReportOptions): Promise<AnthropicAPIResponse<ClaudeCodeUsageReportItem>> {
    const url = new URL("https://api.anthropic.com/v1/organizations/usage_report/claude_code")

    url.searchParams.set("starting_at", params.startingAt)

    if (params.limit !== undefined) {
      url.searchParams.set("limit", String(params.limit))
    }

    if (params.page) {
      url.searchParams.set("page", params.page)
    }

    return this.client.get(url, params.signal)
  }

  async messages(params: GetMessagesUsageReportOptions): Promise<AnthropicAPIResponse<MessagesUsageReportTimeBucket>> {
    const url = new URL("https://api.anthropic.com/v1/organizations/usage_report/messages")

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

    if (params.apiKeyIds) {
      for (const apiKeyId of params.apiKeyIds) {
        url.searchParams.append("api_key_ids[]", apiKeyId)
      }
    }

    if (params.workspaceIds) {
      for (const workspaceId of params.workspaceIds) {
        url.searchParams.append("workspace_ids[]", workspaceId)
      }
    }

    if (params.models) {
      for (const model of params.models) {
        url.searchParams.append("models[]", model)
      }
    }

    if (params.serviceTiers) {
      for (const serviceTier of params.serviceTiers) {
        url.searchParams.append("service_tiers[]", serviceTier)
      }
    }

    if (params.contextWindows) {
      for (const contextWindow of params.contextWindows) {
        url.searchParams.append("context_window[]", contextWindow)
      }
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
