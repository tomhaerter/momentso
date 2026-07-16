import type { CursorAdminClient } from "../client"
import type {
  GetCursorDailyUsageDataOptions,
  GetCursorDailyUsageDataResponse,
  GetCursorFilteredUsageEventsOptions,
  GetCursorFilteredUsageEventsResponse,
  GetCursorTeamMembersResponse,
  GetCursorTeamSpendOptions,
  GetCursorTeamSpendResponse
} from "./interfaces"

export interface GetCursorTeamMembersOptions {
  signal?: AbortSignal
}

export class Teams {
  private readonly client: CursorAdminClient

  constructor(client: CursorAdminClient) {
    this.client = client
  }

  async members(options: GetCursorTeamMembersOptions = {}): Promise<GetCursorTeamMembersResponse> {
    const url = new URL("https://api.cursor.com/teams/members")

    return this.client.get(url, options.signal)
  }

  async dailyUsageData(options: GetCursorDailyUsageDataOptions): Promise<GetCursorDailyUsageDataResponse> {
    const url = new URL("https://api.cursor.com/teams/daily-usage-data")
    const { signal, ...payload } = options

    return this.client.post(url, payload, signal)
  }

  async spend(options: GetCursorTeamSpendOptions = {}): Promise<GetCursorTeamSpendResponse> {
    const url = new URL("https://api.cursor.com/teams/spend")
    const { signal, ...payload } = options

    return this.client.post(url, payload, signal)
  }

  async filteredUsageEvents(options: GetCursorFilteredUsageEventsOptions = {}): Promise<GetCursorFilteredUsageEventsResponse> {
    const url = new URL("https://api.cursor.com/teams/filtered-usage-events")
    const { signal, ...payload } = options

    return this.client.post(url, payload, signal)
  }
}
