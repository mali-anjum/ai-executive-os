import { getAuthHeaders } from "@/auth/services/headers";
import {
  apiErrorMessage,
} from "@/common/api/errors/apiErrorMessage";
import { fetchWithTimeout } from "@/common/api/fetch";
import { ApiClientError } from "./errors/ApiClientError";
import { parseApiErrorBody } from "./errors/parseApiErrorBody";

export type {
  AnalyticsDashboard,
  Citation,
  DocumentRecord,
  IngestResponse,
  QueryRequest,
  QueryResponse,
  QueryResult,
  TicketRecord,
  TopQuestionRow,
  UserProfile,
} from "@/common/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export function documentFileUrl(documentId: string): string {
  return `${API_BASE}/documents/${documentId}/file`;
}

export async function parseJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = await getAuthHeaders();
  const res = await fetchWithTimeout(url, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.text();
    const message = apiErrorMessage(res.status, body, res.statusText);
    throw new ApiClientError(message, res.status, parseApiErrorBody(body));
  }
  return res;
}