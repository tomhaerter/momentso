import camelcaseKeys from "camelcase-keys"

import { Organizations } from "./organizations"
import { throwAnthropicAPIError } from "./utils"

export class AnthropicAdminClient {
  private readonly apiKey: string
  public readonly organizations = new Organizations(this)

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async get<T>(url: URL, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": this.apiKey
      },
      signal
    })

    const body = await response.json()

    if (!response.ok) {
      throwAnthropicAPIError({ body, status: response.status })
    }

    return camelcaseKeys(body, { deep: true }) as T
  }
}

export function anthropicAdmin(apiKey: string) {
  return new AnthropicAdminClient(apiKey)
}
