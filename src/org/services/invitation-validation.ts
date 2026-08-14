/**
 * Pure helpers for the organization invitation flow (no React/Redux deps).
 *
 * This is a UX mirror of the backend RBAC — the authoritative check is enforced
 * server-side (see backend `app/core/rbac.py`). Frontend visibility is not
 * authorization.
 */
import { ORG_ROLES, type OrgRole } from "@/common/types/tenancy";

export const INVITABLE_ROLES: readonly OrgRole[] = [
  "admin",
  "manager",
  "employee",
];

export function isWorkEmail(email: string): boolean {
  const value = email.trim();
  if (!value.includes("@")) return false;
  if (/\s/.test(value)) return false;
  const local = value.split("@")[0];
  return local.length > 0;
}

/**
 * Mirror of backend `can_assign_role`: only an owner may assign the owner role;
 * admins may assign admin/manager/employee; manager/employee cannot assign.
 */
export function canAssignRole(assigner: OrgRole | string, target: OrgRole): boolean {
  if (target === "owner") return assigner === "owner";
  return assigner === "owner" || assigner === "admin";
}

/** Roles that a given user may invite (excludes the owner role for non-owners). */
export function invitableRolesFor(assigner: OrgRole | string): OrgRole[] {
  if (assigner === "owner") return [...ORG_ROLES];
  return [...INVITABLE_ROLES];
}
