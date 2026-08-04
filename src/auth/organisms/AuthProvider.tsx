"use client";

import { useEffect } from "react";
import { createClient } from "@/common/services/supabase/client";
import { isSupabaseConfigured } from "@/common/services/supabase/env";
import { useOrg } from "@/common/hooks/useOrg";
import { useUser } from "@/common/hooks/useUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useUser();
  const { setOrg, clearOrg } = useOrg();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();

    const syncSession = (
      session: {
        user: {
          email?: string;
          user_metadata?: Record<string, unknown>;
        };
      } | null,
    ) => {
      if (!session?.user) {
        clearUser();
        clearOrg();
        return;
      }

      const meta = session.user.user_metadata ?? {};

      setUser({
        email: session.user.email ?? null,
        role: typeof meta.role === "string" ? meta.role : "employee",
      });

      setOrg({
        orgId: meta.org_id !== undefined ? String(meta.org_id) : null,

        orgName: meta.org_name !== undefined ? String(meta.org_name) : null,
      });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, setOrg, clearOrg]);

  return children;
}
