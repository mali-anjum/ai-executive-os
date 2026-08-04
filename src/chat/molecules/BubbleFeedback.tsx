"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/common/atoms/ui/button";
import { cn } from "@/common/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

import { useSubmitQueryFeedbackMutation } from "@/common/api/endpoints/knowledge.api";

import { getApiErrorMessage } from "@/common/api/errors/getApiErrorMessage";

type FeedbackValue = "positive" | "negative";

interface BubbleFeedbackProps {
  queryLogId: string;
}

export function BubbleFeedback({ queryLogId }: BubbleFeedbackProps) {
  const [submitQueryFeedback, { isLoading }] = useSubmitQueryFeedbackMutation();

  const [feedbackState, setFeedbackState] = useState<FeedbackValue | null>(
    null,
  );

  const sendFeedback = async (value: FeedbackValue) => {
    if (isLoading || feedbackState) {
      return;
    }

    try {
      await submitQueryFeedback({
        queryLogId,
        feedback: value,
      }).unwrap();

      setFeedbackState(value);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground">Helpful?</span>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        disabled={isLoading || feedbackState !== null}
        aria-label="Helpful"
        onClick={() => void sendFeedback("positive")}
      >
        <ThumbsUp
          className={cn(
            "h-3.5 w-3.5",
            feedbackState === "positive" && "text-accent-blue",
          )}
        />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        disabled={isLoading || feedbackState !== null}
        aria-label="Not helpful"
        onClick={() => void sendFeedback("negative")}
      >
        <ThumbsDown
          className={cn(
            "h-3.5 w-3.5",
            feedbackState === "negative" && "text-warning",
          )}
        />
      </Button>

      {feedbackState && (
        <span className="text-[11px] text-muted-foreground">Thanks</span>
      )}
    </div>
  );
}
