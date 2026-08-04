import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { getAuthHeaders } from "@/auth/services/headers";
import { API_BASE } from "@/common/constants";
import { apiErrorMessage } from "@/common/api/errors/apiErrorMessage";
import { parseApiErrorBody } from "@/common/api/errors/parseApiErrorBody";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const authHeaders = await getAuthHeaders();
  
  const request =
    typeof args === "string"
      ? {
          url: args,
          headers: authHeaders,
        }
      : {
          ...args,
          headers: {
            ...authHeaders,
            ...(args.headers ?? {}),
          },
        };
        console.time(
          typeof args === "string" ? args : args.url
        );
  const result = await rawBaseQuery(request, api, extraOptions);
  console.timeEnd(
    typeof args === "string" ? args : args.url
  );
  if (!result.error) {
    return result;
  }

  const { status } = result.error;

  if (typeof status !== "number") {
    return result;
  }

  let message = "Request failed.";
  let parsedBody;

  if (typeof result.error.data === "string") {
    parsedBody = parseApiErrorBody(result.error.data);

    message = apiErrorMessage(
      status,
      result.error.data,
      message,
    );
  } else if (
    result.error.data &&
    typeof result.error.data === "object"
  ) {
    parsedBody = result.error.data;
  }

  return {
    error: {
      ...result.error,
      data: {
        message,
        body: parsedBody,
      },
    },
  };
};