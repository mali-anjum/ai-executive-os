import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { getAuthHeaders } from "@/auth/services/headers";
import {
  ApiClientError,
  apiErrorMessage,
  parseApiErrorBody,
} from "@/common/api/errors";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const headers = await getAuthHeaders();

  const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headersObj) => {
      // Add all auth headers
      Object.entries(headers).forEach(([key, value]) => {
        headersObj.set(key, value);
      });
      return headersObj;
    },
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    let errorMessage = "An error occurred";
    if ("error" in result.error) {
      errorMessage = result.error.error;
    }

    let parsedBody;

    if (typeof status === "number") {
      try {
        const response = result.error.data as string;
        if (response) {
          parsedBody = parseApiErrorBody(response);
          errorMessage = apiErrorMessage(status, response, errorMessage);
        }
      } catch (e) {
        // If parsing fails, use default error message
      }

      throw new ApiClientError(errorMessage, status, parsedBody);
    }
  }

  return result;
};
