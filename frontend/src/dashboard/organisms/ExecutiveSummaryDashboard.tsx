"use client";

import { Clock, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/dashboard/atoms/KpiCard";
import { Card, CardContent } from "@/common/atoms/ui/card";
import { LoadingBlock } from "@/common/molecules/LoadingBlock";
import { useGetExecutiveSummaryQuery } from "@/common/api/endpoints/dashboard.api";

export function ExecutiveSummaryDashboard() {
  const { data: summary, error, isLoading } = useGetExecutiveSummaryQuery();

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load executive summary.
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <section className="space-y-4" aria-label="Executive summary">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Executive summary
          </h2>
          <p className="text-sm text-muted-foreground">
            ROI at a glance — Organization-wide
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <LoadingBlock rows={2} label="Loading executive summary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const scopeNote = summary.department_scope
    ? `Scoped to ${summary.department_scope} department`
    : "Organization-wide";

  return (
    <section className="space-y-4" aria-label="Executive summary">
      <div>
        <h2 className="font-display text-lg font-semibold">
          Executive summary
        </h2>
        <p className="text-sm text-muted-foreground">
          ROI at a glance — {scopeNote}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Queries automated"
          value={String(summary.automated_queries ?? 0)}
          hint={`${summary.automation_rate_pct ?? 0}% of ${summary.total_queries ?? 0} total`}
          icon={MessageSquare}
        />
        <KpiCard
          label="Hours saved (est.)"
          value={`${summary.estimated_hours_saved ?? 0}h`}
          hint="25 min saved per automated lookup"
          icon={Clock}
        />
        <KpiCard
          label="Queries today"
          value={String(summary.queries_today ?? 0)}
          icon={TrendingUp}
        />
        <KpiCard
          label="Knowledge gaps"
          value={String(
            (summary.knowledge_gaps?.length ?? 0) +
              (summary.low_confidence_unanswered ?? 0),
          )}
          hint={`${summary.escalated_queries ?? 0} escalated`}
          icon={AlertTriangle}
        />
      </div>
      {(summary.knowledge_gaps?.length ?? 0) > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-foreground">
              Top knowledge gaps
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.knowledge_gaps?.slice(0, 5).map((row) => (
                <li
                  key={row.question}
                  className="flex justify-between gap-4 border-b border-border-subtle py-2 last:border-0"
                >
                  <span>{row.question}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {row.count}× escalated
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
