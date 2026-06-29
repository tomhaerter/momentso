// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: string
    name: string
    email: string
    workspaceId: string
    userId: string
  }

  interface UserSession {}

  interface SecureSessionData {
    token: string
    workspaceId: string
    userId: string
  }
}

export {}
