import type { UserRole } from "./server/database/schema"

// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    role: UserRole
    organisationId: string
  }

  interface UserSession {}

  interface SecureSessionData {
    token: string
    organisationId: string
  }
}

export {}
