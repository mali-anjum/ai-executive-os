"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/common/atoms/ui/button";
import { cn } from "@/common/lib/utils";

interface BubbleConfidenceProps {
  confidenceScore?: number | null;
  escalated?: boolean;
  escalationEnabled: boolean;

  userQuery?: string;

  onEscalate?: () => void;
}

export function BubbleConfidence({
  confidenceScore,
  escalated = false,
  escalationEnabled,
  userQuery,
  onEscalate,
}: BubbleConfidenceProps) {
  const [escalateBusy, setEscalateBusy] = useState(false);

  if (confidenceScore == null) {
    return null;
  }

  const confidencePercentage = Math.round(confidenceScore * 100);

  const lowConfidence = confidenceScore < 0.45 && !escalated;

  const handleEscalate = async () => {
    if (!onEscalate) {
      return;
    }

    setEscalateBusy(true);

    try {
      onEscalate();
    } finally {
      setEscalateBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div
        className="
          flex 
          items-center 
          justify-between 
          text-[11px]
          text-muted-foreground
        "
      >
        <span>Confidence</span>

        <span
          className={
            lowConfidence || escalated
              ? "font-medium text-warning"
              : "font-medium text-foreground"
          }
        >
          {confidencePercentage}%
        </span>
      </div>

      <div
        className="
          h-1.5 
          overflow-hidden 
          rounded-full 
          bg-muted
        "
        role="progressbar"
        aria-valuenow={confidencePercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",

            lowConfidence || escalated ? "bg-warning" : "bg-accent-blue",
          )}
          style={{
            width: `${confidencePercentage}%`,
          }}
        />
      </div>

      {escalated && (
        <p
          className="
              flex
              items-center
              gap-1
              text-[11px]
              font-medium
              text-warning
            "
        >
          <AlertCircle className="h-3 w-3" aria-hidden />
          Escalated to human support
        </p>
      )}

      {escalationEnabled && lowConfidence && onEscalate && userQuery ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 text-xs"
          disabled={escalateBusy}
          onClick={() => void handleEscalate()}
        >
          Request human help
        </Button>
      ) : null}
    </div>
  );
}
