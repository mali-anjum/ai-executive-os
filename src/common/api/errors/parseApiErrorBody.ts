import { ApiErrorResponse, isApiErrorResponse } from "@/common/types";

export function parseApiErrorBody(text: string): ApiErrorResponse | undefined {
    try {
      const value: unknown = JSON.parse(text);
      return isApiErrorResponse(value) ? value : undefined;
    } catch {
      return undefined;
    }
  }