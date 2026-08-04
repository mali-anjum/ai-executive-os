import { parseApiErrorBody } from "./parseApiErrorBody";

/**
 * Converts a raw HTTP error response into a user-friendly message.
 *
 * Use only in the networking layer (fetch wrappers, baseQuery, authFetch,
 * or other low-level API utilities) where the HTTP status and response
 * body are available.
 */

export function apiErrorMessage(
  status: number,
  text: string,
  fallback: string
): string {
  const parsed = parseApiErrorBody(text);
  if (parsed?.error.message) {
    return parsed.error.message;
  }
  const short = text.length > 200 ? `${text.slice(0, 200)}…` : text;
  return short || fallback || `Request failed (${status})`;
}
