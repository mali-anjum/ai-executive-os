"use client";

import { useState } from "react";
import { Button } from "@/common/atoms/Button";
import { Input } from "@/common/atoms/Input";
import type { InvitationCreateRequest } from "@/common/types";
import type { OrgRole } from "@/common/types/tenancy";
import { INVITABLE_ROLES, isWorkEmail } from "@/org/services/invitation-validation";

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export function InviteMembersForm({
  onInvite,
  invitableRoles = INVITABLE_ROLES,
  busy = false,
}: {
  onInvite: (body: InvitationCreateRequest) => Promise<void>;
  invitableRoles?: readonly OrgRole[];
  busy?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("employee");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWorkEmail(email)) {
      setError("Enter a valid work email.");
      return;
    }
    setError(null);
    await onInvite({
      email,
      role,
      department: department.trim() || null,
      expires_in_days: 7,
    });
    setEmail("");
    setDepartment("");
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-foreground">Invite a teammate</p>
      <Input
        label="Work email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@company.com"
        error={error ?? undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole)}
            className="h-10 rounded-lg border border-border bg-surface-elevated px-3 text-sm text-foreground"
          >
            {invitableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Department (optional)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Sales"
        />
      </div>
      <Button type="submit" isLoading={busy}>
        Send invitation
      </Button>
    </form>
  );
}
