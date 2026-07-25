"use client";

import { useUser } from "@/common/hooks/useUser";
import { getRolePermissions } from "@/auth/hooks/getRolePermissions";
/**
 * React hook for accessing the current user's role and permissions.
 *
 * Use only inside React Client Components.
 * Reads the current user's role from application state and delegates
 * permission logic to `getRolePermissions()`.
 */
export function useRole() {
  const { role } = useUser();

  return getRolePermissions(role);
}