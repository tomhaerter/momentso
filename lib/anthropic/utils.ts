import { AnthropicAPIError, ERROR_TYPE_TO_CLASS, isAnthropicErrorResponse } from "./errors"

interface ThrowAnthropicAPIErrorOptions {
  body: unknown
  status: number
}

export function throwAnthropicAPIError({ body, status }: ThrowAnthropicAPIErrorOptions): never {
  if (!isAnthropicErrorResponse(body)) {
    throw new AnthropicAPIError(`Request failed with status ${status}`, { status, body })
  }

  throw new ERROR_TYPE_TO_CLASS[body.error?.type](body.error?.message, {
    status,
    requestId: body.request_id
  })
}
