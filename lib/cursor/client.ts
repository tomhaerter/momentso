import { Teams } from "./teams"
import { encodeApiKey } from "./utils"

export class CursorAdminClient {
  private readonly apiKey: string
  public readonly teams: Teams

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.teams = new Teams(this)
  }

  async get<T>(url: URL, signal?: AbortSignal): Promise<T> {
    return this.request<T>(url, { method: "GET" }, signal)
  }

  async post<T>(url: URL, body: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      },
      signal
    )
  }

  private async request<T>(url: URL, init: RequestInit, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${encodeApiKey(this.apiKey)}`,
        ...init.headers
      },
      signal
    })

    if (response.ok) {
      return response.json() as T
    }

    const body = await response.json()

    const errorMessage =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Cursor API request failed with status ${response.status}`

    throw new Error(errorMessage)
  }
}

export function cursorAdmin(apiKey: string) {
  return new CursorAdminClient(apiKey)
}
