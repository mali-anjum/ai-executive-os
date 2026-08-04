"use client";

import { ErrorState } from "@/common/molecules/ErrorState";
import { GapList } from "@/dashboard/molecules/GapList";
import { useGetUnansweredReportQuery } from "@/common/api/endpoints/evaluation.api";

export function UnansweredQuestionsReport() {
  const { data: report, error, isLoading, refetch } = useGetUnansweredReportQuery();

  if (error) {
    return (
      <ErrorState 
        title="Failed to load reports" 
        error={error} 
        onRetry={refetch} 
      />
    );
  }

  if (isLoading || !report) {
    return <div className="text-sm text-muted-foreground">Loading Unanswered Reports...</div>;
  }

  return (
    <section className="space-y-4" aria-label="Unanswered questions report">
      <div>
        <h2 className="font-display text-lg font-semibold">
          Unanswered questions report
        </h2>
        <p className="text-sm text-muted-foreground">
          Where your knowledge base is weak — {report.total_gaps} distinct gaps tracked
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GapList
          title="Escalated to human"
          rows={report.escalated}
          empty="No escalations yet — great coverage."
        />

        <GapList
          title="Low confidence (not escalated)"
          rows={report.low_confidence}
          empty="No low-confidence queries without escalation."
        />

        <GapList
          title="Negative feedback"
          rows={report.negative_feedback}
          empty="No thumbs-down feedback yet."
        />
      </div>
    </section>
  );
}