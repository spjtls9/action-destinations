import { CustomError } from 'ts-custom-error'

/**
 * Error due to generic misconfiguration of user settings.
 * Should include a user-friendly message, and optionally an error reason and status code.
 * - 4xx errors are not automatically retried, except for 408, 423, 429
 * - 5xx are automatically retried, except for 501
 */
export class IntegrationError extends CustomError {
  code: string | undefined
  status: number | undefined

  /**
   * @param message - a human-friendly message to display to users
   * @param code - an optional error code/reason
   * @param status - an optional http status code (e.g. 400)
   */
  constructor(message = '', code?: string, status?: number) {
    super(message)
    this.status = status
    this.code = code
  }
}

type RetryableStatusCodes =
  | 408
  | 423
  | 429
  | 500
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 509
  | 510
  | 511
  | 598
  | 599

/**
 * Error that should halt execution but allows the request to be retried automatically.
 * This error signals to Segment that a transient error occurred, and retrying the request may succeed without user intervention.
 */
export class RetryableError extends CustomError {
  status: RetryableStatusCodes
  code = ErrorCodes.RETRYABLE_ERROR

  constructor(message = '', status: RetryableStatusCodes = 500) {
    super(message)
    this.status = status
  }
}

/**
 * Error for when a user's authentication is not valid.
 * This could happen when a token or API key has expired or been revoked,
 * or various other scenarios where the authentication credentials are no longer valid.
 *
 * This error signals to Segment that the user must manually fix their credentials for events to succeed.
 */
export class InvalidAuthenticationError extends CustomError {
  status = 401
  code: string
  constructor(message = '', code = ErrorCodes.INVALID_AUTHENTICATION) {
    super(message)
    this.code = code
  }
}

/**
 * Error to indicate the payload is missing fields that are required.
 * Should include a user-friendly message.
 * These errors will not be retried and the user has to fix the payload.
 */
export class PayloadValidationError extends IntegrationError {
  /**
   * @param message - a human-friendly message to display to users
   */
  constructor(message: string) {
    super(message, ErrorCodes.PAYLOAD_VALIDATION_FAILED, 400)
  }
}

/**
 * Error to indicate that an API call to the destination failed with non-retryable error.
 * Most of the HTTP API Errors are handled automatically by the framework. It is recommended to use this error class
 * for cases where the destination has to capture HTTPErrors and rethrow them for better error message or for handling special scenarios.
 * Should include a user-friendly message. These errors will not be retried.
 */
export class APIError extends IntegrationError {
  /**
   * @param message - a human-friendly message to display to users
   */
  constructor(message: string) {
    super(message, ErrorCodes.API_CALL_FAILED, 400)
  }
}

/**
 * Standard error codes. Use one from this enum whenever possible.
 */
export enum ErrorCodes {
  // Invalid API Key or Access Token
  INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION',
  // Payload is missing a field or has invalid value
  PAYLOAD_VALIDATION_FAILED = 'PAYLOAD_VALIDATION_FAILED',
  // The currency code is not in valid ISO format
  INVALID_CURRENCY_CODE = 'INVALID_CURRENCY_CODE',
  // Generic retryable error
  RETRYABLE_ERROR = 'RETRYABLE_ERROR',
  // Refresh token has expired
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  // OAuth refresh failed
  OAUTH_REFRESH_FAILED = 'OAUTH_REFRESH_FAILED',
  // Integration API call failed
  API_CALL_FAILED = 'API_CALL_FAILED'
}
