"use client";

import { useMemo } from "react";
import { type TicketRecord } from "@/common/api/client";
import { ticketsPolling } from "@/common/config/polling.config";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useListTicketsQuery } from "@/common/api/endpoints/tickets.api";

function normalizeTickets(data: TicketRecord[]): TicketRecord[] {
  const byId = new Map<string, TicketRecord>();
  for (const ticket of data) {
    byId.set(ticket.id, ticket);
  }
  return [...byId.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function useTickets() {
  const enabled = useFeatureFlag("PROJECT_AGENT_ENABLED");

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useListTicketsQuery(undefined, {
    skip: !enabled,
    pollingInterval: ticketsPolling.intervalMs,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const tickets = useMemo(() => {
    if (!data) return [];

    return normalizeTickets(data);
  }, [data]);

  return {
    tickets,
    isLoading,
    isFetching,
    error,
    refresh: refetch,
  };
}
