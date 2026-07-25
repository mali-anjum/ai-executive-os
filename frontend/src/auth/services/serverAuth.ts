import { createClient } from "@/common/services/supabase/server";
import type { ServerAuth } from "@/auth/types/ServerAuth";

export async function getServerAuth(): Promise<ServerAuth> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      org: null,
    };
  }

  const metadata = (user.user_metadata ?? {}) as {
    role?: string;
    org_id?: string;
    org_name?: string;
  };

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      role: String(metadata.role ?? "employee"),
    },

    org: {
      orgId: metadata.org_id ? String(metadata.org_id) : null,

      orgName: metadata.org_name ? String(metadata.org_name) : null,
    },
  };
}
