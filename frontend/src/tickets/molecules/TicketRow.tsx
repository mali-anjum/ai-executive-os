"use client";

import { Badge } from "@/common/atoms/Badge";
import { Button } from "@/common/atoms/ui/button";
import {
  useApproveTicketMutation,
  useRejectTicketMutation,
} from "@/common/api/endpoints/tickets.api";
import { getApiErrorMessage } from "@/common/api/errorMessage";
import type { TicketRecord } from "@/common/types";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useRole } from "@/common/hooks/useRole";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

const priorityColors: Record<number, string> = {
  1: "bg-muted text-muted-foreground",
  2: "bg-accent-blue/15 text-accent-blue",
  3: "bg-warning/15 text-warning",
  4: "bg-orange-500/15 text-orange-400",
  5: "bg-destructive/15 text-destructive",
};

interface TicketRowProps {
  ticket: TicketRecord;
  onUpdated?: () => void;
}

export function TicketRow({
  ticket,
  onUpdated,
}: TicketRowProps) {
  const approvalEnabled = useFeatureFlag("TICKET_APPROVAL_ENABLED");
  const { isLeadership } = useRole();

  const [
    approveTicket,
    {
      isLoading: isApproving,
    },
  ] = useApproveTicketMutation();

  const [
    rejectTicket,
    {
      isLoading: isRejecting,
    },
  ] = useRejectTicketMutation();

  const busy = isApproving || isRejecting;

  const priorityClass =
    ticket.priority != null
      ? priorityColors[ticket.priority] ?? "bg-muted text-muted-foreground"
      : "bg-muted text-muted-foreground";

  const pending =
    ticket.requires_approval &&
    (ticket.approval_status === "pending" ||
      ticket.approval_status === "pending_approval" ||
      ticket.status === "pending_approval");

  async function handleApprove() {
    if (busy) return;

    try {
      await approveTicket(ticket.id).unwrap();

      toast.success("Ticket approved.");

      onUpdated?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleReject() {
    if (busy) return;

    try {
      await rejectTicket(ticket.id).unwrap();

      toast.success("Ticket rejected.");

      onUpdated?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <tr className="border-t border-border-subtle transition-colors hover:bg-muted/40">
      <td className="px-4 py-3.5">
        <p className="font-medium text-foreground">
          {ticket.summary ?? "—"}
        </p>

        <p className="mt-0.5 text-xs capitalize text-muted-foreground">
          {ticket.intent?.replace(/_/g, " ") ?? "unknown"}
        </p>
      </td>

      <td className="px-4 py-3.5">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
            priorityClass
          )}
        >
          P{ticket.priority ?? "?"}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <Badge status={ticket.status} />
      </td>

      <td className="px-4 py-3.5 capitalize text-muted-foreground">
        {ticket.source}
      </td>

      <td className="px-4 py-3.5 text-muted-foreground">
        {ticket.assignee_email ?? "Unassigned"}
      </td>

      <td className="px-4 py-3.5 text-xs text-muted-foreground">
        <div>{new Date(ticket.created_at).toLocaleString()}</div>

        {ticket.external_ticket_id && (
          <div className="mt-1 text-accent-blue">
            Jira: {ticket.external_ticket_id}
          </div>
        )}

        {approvalEnabled && isLeadership && pending && (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => void handleApprove()}
            >
              {isApproving ? "Approving..." : "Approve"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => void handleReject()}
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}