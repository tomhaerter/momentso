export type AnthropicErrorType =
  | "api_error"
  | "authentication_error"
  | "billing_error"
  | "invalid_request_error"
  | "not_found_error"
  | "overloaded_error"
  | "permission_error"
  | "rate_limit_error"
  | "timeout_error"

export interface AnthropicErrorPayload {
  message: string
  type: AnthropicErrorType
  [key: string]: unknown
}

export interface AnthropicErrorResponse {
  error: AnthropicErrorPayload
  request_id: string | null
  type: "error"
  [key: string]: unknown
}

export class AnthropicAPIError extends Error {
  readonly status: number
  readonly errorType?: AnthropicErrorType
  readonly requestId?: string | null
  readonly body?: AnthropicErrorResponse | unknown

  constructor(
    message: string,
    options: {
      status: number
      errorType?: AnthropicErrorType
      requestId?: string | null
      body?: AnthropicErrorResponse | unknown
      cause?: unknown
    }
  ) {
    super(message, { cause: options.cause })
    this.name = "AnthropicAPIError"
    this.status = options.status
    this.errorType = options.errorType
    this.requestId = options.requestId
    this.body = options.body
  }
}

export class AnthropicAuthenticationError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "authentication_error" })
    this.name = "AnthropicAuthenticationError"
  }
}

export class AnthropicPermissionError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "permission_error" })
    this.name = "AnthropicPermissionError"
  }
}

export class AnthropicRateLimitError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "rate_limit_error" })
    this.name = "AnthropicRateLimitError"
  }
}

export class AnthropicTimeoutError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "timeout_error" })
    this.name = "AnthropicTimeoutError"
  }
}

export class AnthropicOverloadedError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "overloaded_error" })
    this.name = "AnthropicOverloadedError"
  }
}

export class AnthropicBillingError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "billing_error" })
    this.name = "AnthropicBillingError"
  }
}

export class AnthropicInvalidRequestError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "invalid_request_error" })
    this.name = "AnthropicInvalidRequestError"
  }
}

export class AnthropicNotFoundError extends AnthropicAPIError {
  constructor(message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) {
    super(message, { ...options, errorType: "not_found_error" })
    this.name = "AnthropicNotFoundError"
  }
}

export class AnthropicGenericAPIError extends AnthropicAPIError {
  constructor(
    message: string,
    options: { status: number; errorType?: AnthropicErrorType; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }
  ) {
    super(message, { ...options, errorType: options.errorType ?? "api_error" })
    this.name = "AnthropicGenericAPIError"
  }
}

export class AnthropicNetworkError extends Error {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, options)
    this.name = "AnthropicNetworkError"
  }
}

export const ERROR_TYPE_TO_CLASS: Record<
  AnthropicErrorType,
  new (message: string, options: { status: number; requestId?: string | null; body?: AnthropicErrorResponse | unknown; cause?: unknown }) => AnthropicAPIError
> = {
  authentication_error: AnthropicAuthenticationError,
  permission_error: AnthropicPermissionError,
  rate_limit_error: AnthropicRateLimitError,
  timeout_error: AnthropicTimeoutError,
  overloaded_error: AnthropicOverloadedError,
  billing_error: AnthropicBillingError,
  invalid_request_error: AnthropicInvalidRequestError,
  not_found_error: AnthropicNotFoundError,
  api_error: AnthropicGenericAPIError
}

export function isAnthropicErrorResponse(value: unknown): value is AnthropicErrorResponse {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<AnthropicErrorResponse>

  if (candidate.type !== "error") {
    return false
  }

  const error = candidate.error as Partial<AnthropicErrorPayload> | undefined

  if (!error || typeof error.message !== "string" || typeof error.type !== "string") {
    return false
  }

  return true
}
