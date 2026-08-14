"use client";

import type { MemberRecord } from "@/common/types";

const ROLE_BADGE: Record<string, string> = {
  owner: "text-violet-700 bg-violet-100",
  admin: "text-accent-blue bg-blue-100",
  manager: "text-sky-700 bg-sky-100",
  employee: "text-muted-foreground bg-muted",
};

export function MemberList({ members }: { members: MemberRecord[] }) {
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {members.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {m.full_name || m.email}
            </p>
            <p className="truncate text-xs text-muted-foreground">{m.email}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              ROLE_BADGE[m.role] ?? ROLE_BADGE.employee
            }`}
          >
            {m.role}
          </span>
        </li>
      ))}
    </ul>
  );
}
