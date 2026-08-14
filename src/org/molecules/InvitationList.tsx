"use client";

import { Button } from "@/common/atoms/Button";
import type { InvitationRecord } from "@/common/types";

function statusBadge(status: InvitationRecord["status"]) {
  const map: Record<InvitationRecord["status"], string> = {
    pending: "text-amber-700 bg-amber-100",
    accepted: "text-emerald-700 bg-emerald-100",
    revoked: "text-muted-foreground bg-muted",
    expired: "text-muted-foreground bg-muted",
  };
  return map[status] ?? "text-muted-foreground bg-muted";
}

export function InvitationList({
  invitations,
  onRevoke,
  revokingId,
}: {
  invitations: InvitationRecord[];
  onRevoke: (id: string) => void;
  revokingId?: string | null;
}) {
  if (invitations.length === 0) {
    return <p className="text-sm text-muted-foreground">No pending invitations.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {invitations.map((inv) => (
        <li key={inv.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
            <p className="text-xs text-muted-foreground">
              {inv.role} · {inv.department ?? "No department"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(inv.status)}`}
            >
              {inv.status}
            </span>
            {inv.status === "pending" ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRevoke(inv.id)}
                disabled={revokingId === inv.id}
              >
                Revoke
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
