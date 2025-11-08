/**
 * Result Type Pattern for Better Error Handling
 *
 * Instead of returning `null` for all errors, we use a discriminated union
 * that allows callers to distinguish between success and different error types.
 */

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Application Error Types
 */
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Common Error Codes
 */
export const ErrorCodes = {
  // Not Found Errors
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",

  // Authentication Errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // Validation Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Database Errors
  DATABASE_ERROR: "DATABASE_ERROR",
  QUERY_ERROR: "QUERY_ERROR",

  // Unknown Errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Helper function to create error results
 */
export function createError(
  code: string,
  message: string,
  details?: unknown
): AppError {
  return { code, message, details };
}

/**
 * Helper function to create success results
 */
export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper function to create failure results
 */
export function createFailure<T>(error: AppError): Result<T> {
  return { success: false, error };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if result is a failure
 */
export function isFailure<T>(result: Result<T>): result is { success: false; error: AppError } {
  return result.success === false;
}
