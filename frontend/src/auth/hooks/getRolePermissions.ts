/**
 * Pure role/permission utility.
 *
 * Use anywhere role permissions need to be evaluated:
 * - Server Components
 * - Route Handlers / API
 * - Middleware
 * - Tests
 * - Client Components
 *
 * Contains no React or Redux dependencies.
 * This is the single source of truth for role-based permissions.
 */
export function getRolePermissions(role?: string | null) {
  const normalizedRole = role ?? "employee";

  const isAdmin = normalizedRole === "admin";
  const isManager = normalizedRole === "manager";

  return {
    role: normalizedRole,
    isAdmin,
    isManager,
    isLeadership: isAdmin || isManager,
    isEmployee: !isAdmin && !isManager,
  };
}