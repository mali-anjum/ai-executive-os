import { getAuthHeaders } from "@/auth/services/headers";
import {
  ApiClientError,
  apiErrorMessage,
  parseApiErrorBody,
} from "@/common/api/errors";
import { fetchWithTimeout } from "@/common/api/fetch";
import type {
  AnalyticsDashboard,
  DemoSeedResponse,
  IngestResponse,
  QueryRequest,
  QueryResponse,
  TicketRecord,
} from "@/common/types";

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

async function parseJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
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
export async function deleteDocument(documentId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetchWithTimeout(`${API_BASE}/documents/${documentId}`, {
    method: "DELETE",
    headers,
  });
  if (res.status === 404) {
    return;
  }
  if (!res.ok && res.status !== 204) {
    const body = await res.text();
    throw new ApiClientError(
      apiErrorMessage(res.status, body, res.statusText),
      res.status,
      parseApiErrorBody(body)
    );
  }
}

export async function queryKnowledge(
  query: string,
  sessionId?: string | null
): Promise<QueryResponse> {
  const body: QueryRequest = { query, session_id: sessionId ?? null };
  const res = await authFetch(`${API_BASE}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseJson<QueryResponse>(res);
}

export async function fetchAnalytics(): Promise<AnalyticsDashboard> {
  const res = await authFetch(`${API_BASE}/analytics/dashboard`, {
    cache: "no-store",
  });
  return parseJson<AnalyticsDashboard>(res);
}

export async function listTickets(): Promise<TicketRecord[]> {
  const res = await authFetch(`${API_BASE}/tickets`, { cache: "no-store" });
  return parseJson<TicketRecord[]>(res);
}

export async function approveTicket(ticketId: string): Promise<TicketRecord> {
  const res = await authFetch(`${API_BASE}/tickets/${ticketId}/approve`, {
    method: "POST",
  });
  return parseJson<TicketRecord>(res);
}

export async function rejectTicket(ticketId: string): Promise<TicketRecord> {
  const res = await authFetch(`${API_BASE}/tickets/${ticketId}/reject`, {
    method: "POST",
  });
  return parseJson<TicketRecord>(res);
}

export async function seedDemoTenant(): Promise<DemoSeedResponse> {
  const res = await authFetch(`${API_BASE}/demo/seed`, { method: "POST" });
  return parseJson(res);
}



export async function submitQueryFeedback(
  queryLogId: string,
  feedback: "positive" | "negative"
): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetchWithTimeout(
    `${API_BASE}/queries/${queryLogId}/feedback`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ feedback }),
    }
  );
  if (!res.ok && res.status !== 204) {
    const body = await res.text();
    throw new ApiClientError(
      apiErrorMessage(res.status, body, res.statusText),
      res.status,
      parseApiErrorBody(body)
    );
  }
}

export async function resyncAllConnectors(): Promise<void> {
  await authFetch(`${API_BASE}/connectors/resync-all`, { method: "POST" });
}

export async function syncGoogleDriveFile(
  fileId: string,
  options?: { allowedDepartments?: string[]; allowedRoles?: string[] }
): Promise<IngestResponse> {
  const res = await authFetch(`${API_BASE}/connectors/google-drive/sync`, {
    method: "POST",
    body: JSON.stringify({
      file_id: fileId,
      allowed_departments: options?.allowedDepartments ?? null,
      allowed_roles: options?.allowedRoles ?? null,
    }),
  });
  return parseJson<IngestResponse>(res);
}
