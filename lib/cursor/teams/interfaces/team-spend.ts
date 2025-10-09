import type { CursorTeamRole } from "./team-member"

export interface GetCursorTeamSpendOptions {
  searchTerm?: string
  sortBy?: "amount" | "date" | "user"
  sortDirection?: "asc" | "desc"
  page?: number
  pageSize?: number
  signal?: AbortSignal
}

export interface CursorTeamMemberSpend {
  spendCents: number
  fastPremiumRequests: number
  name: string
  email: string
  role: CursorTeamRole
  hardLimitOverrideDollars: number
}

export interface GetCursorTeamSpendResponse {
  teamMemberSpend: CursorTeamMemberSpend[]
  subscriptionCycleStart: number
  totalMembers: number
  totalPages: number
}
