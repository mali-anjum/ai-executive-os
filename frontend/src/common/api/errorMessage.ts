import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown error";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const serialized = error as SerializedError;

    if (serialized.message) {
      return serialized.message;
    }
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const apiError = error as FetchBaseQueryError;

    if (typeof apiError.data === "string") {
      return apiError.data;
    }

    if (
      typeof apiError.data === "object" &&
      apiError.data !== null
    ) {
      if ("detail" in apiError.data) {
        const detail = apiError.data.detail;

        if (typeof detail === "string") {
          return detail;
        }

        if (
          Array.isArray(detail) &&
          detail.length > 0 &&
          typeof detail[0] === "object" &&
          detail[0] !== null &&
          "msg" in detail[0]
        ) {
          return String(detail[0].msg);
        }
      }

      if (
        "error" in apiError.data &&
        typeof apiError.data.error === "object" &&
        apiError.data.error !== null &&
        "message" in apiError.data.error
      ) {
        return String(apiError.data.error.message);
      }
    }

    return `Request failed (${apiError.status})`;
  }

  return "Unexpected error";
}