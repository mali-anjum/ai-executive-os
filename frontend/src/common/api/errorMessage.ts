import {
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown error";
  }

  // Standard JavaScript Error
  if (error instanceof Error) {
    return error.message;
  }

  // RTK Query SerializedError
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

  // RTK Query FetchBaseQueryError
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const apiError = error as FetchBaseQueryError;

    if (
      typeof apiError.data === "object" &&
      apiError.data !== null
    ) {
      // FastAPI commonly returns:
      // { detail: "..." }
      if (
        "detail" in apiError.data &&
        typeof apiError.data.detail === "string"
      ) {
        return apiError.data.detail;
      }

      // Generic APIs may return:
      // { error: { message: "..." } }
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