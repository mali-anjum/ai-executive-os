import { createClient } from "@/common/services/supabase/client";

const SESSION_TIMEOUT_MS = 8_000;
const SESSION_CACHE_TTL_MS = 60_000; // Re-check Supabase at most once per minute

let cachedHeaders: Record<string, string> | null = null;
let cachedAt = 0;
let inflight: Promise<Record<string, string>> | null = null;

async function getSessionWithTimeout() {
  const supabase = createClient();
  return Promise.race([
    supabase.auth.getSession(),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Supabase session timed out — check network or sign in again")),
        SESSION_TIMEOUT_MS
      );
    }),
  ]);
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const { data } = await getSessionWithTimeout();
    const session = data.session;
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
      const meta = session.user.user_metadata ?? {};
      if (meta.org_id) headers["X-Org-Id"] = String(meta.org_id);
      if (meta.role) headers["X-User-Role"] = String(meta.role);
      if (session.user.id) headers["X-User-Id"] = session.user.id;
    }
  } catch {
    // Supabase not configured — dev headers optional
  }

  return headers;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const now = Date.now();

  // Fast path: return cached headers if fresh.
  if (cachedHeaders && now - cachedAt < SESSION_CACHE_TTL_MS) {
    return cachedHeaders;
  }

  // Deduplicate concurrent calls — only one Supabase round-trip at a time.
  if (inflight) {
    return inflight;
  }

  inflight = buildHeaders()
    .then((headers) => {
      cachedHeaders = headers;
      cachedAt = Date.now();
      return headers;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}