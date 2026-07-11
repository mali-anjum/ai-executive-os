import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined
): string {
  if (!error) {
    return "Unknown error";
  }

  // SerializedError
  if ("message" in error && error.message) {
    return error.message;
  }

  // FetchBaseQueryError
  if ("status" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data
    ) {
      const apiError = data as {
        error?: {
          message?: string;
        };
      };

      return apiError.error?.message ?? "Request failed";
    }

    return `Request failed (${error.status})`;
  }

  return "Unexpected error";
}