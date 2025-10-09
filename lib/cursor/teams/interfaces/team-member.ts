export type CursorTeamRole = "owner" | "member" | "free-owner"

export interface CursorTeamMember {
  name: string
  email: string
  role: CursorTeamRole
}
