"use client";

import { useEffect, type ReactNode } from "react";

import { useUser } from "@/common/hooks/useUser";
import { useOrg } from "@/common/hooks/useOrg";
import type { ServerAuth } from "@/auth/types/ServerAuth";

export function UserHydrationProvider({
  auth,
  children,
}: {
  auth: ServerAuth;
  children: ReactNode;
}) {
  const { setUser, clearUser } = useUser();
  const { setOrg, clearOrg } = useOrg();

  useEffect(() => {
    if (!auth.user) {
      clearUser();
      clearOrg();
      return;
    }

    setUser({
      email: auth.user.email,
      role: auth.user.role,
    });

    setOrg({
      orgId: auth.org?.orgId ?? null,
      orgName: auth.org?.orgName ?? null,
    });
  }, [auth, setUser, clearUser, setOrg, clearOrg]);

  return children;
}