import { ApiErrorResponse } from "@/common/types";

export class ApiClientError extends Error {
    readonly status: number;
    readonly body?: ApiErrorResponse;
  
    constructor(message: string, status: number, body?: ApiErrorResponse) {
      super(message);
      this.name = "ApiClientError";
      this.status = status;
      this.body = body;
    }
  }