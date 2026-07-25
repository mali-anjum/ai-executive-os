import type { ServerAuth } from "@/auth/types/ServerAuth";
import { DashboardInitialUser } from "@/auth/types/DashboardInitializedUser";

export function toDashboardInitialUser(
  auth: ServerAuth,
): DashboardInitialUser | null {
  if (!auth.user) return null;
  return {
    role: auth.user.role,
    email: auth.user.email,
    orgId: auth.org?.orgId ?? null,
    orgName: auth.org?.orgName ?? null,
  };
}
