import { AlertCircle } from "lucide-react";
import { Button } from "@/common/atoms/ui/button";
import { cn } from "@/common/lib/utils";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ErrorStateProps = {
  title?: string;
  error?: FetchBaseQueryError | SerializedError | string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

// Helper function to extract meaningful errors
function getErrorMessage(err: ErrorStateProps["error"]): string {
  if (!err) return "An unexpected error occurred.";
  if (typeof err === "string") return err;

  if ("status" in err) {
    if (err.status === "FETCH_ERROR")
      return "Network error. Please check your internet connection.";
    if (err.status === "PARSING_ERROR")
      return "Failed to process data from server.";

    // Look for backend messages (e.g., { data: { message: "..." } })
    const errorData = err.data as Record<string, unknown> | undefined;
    const detail = errorData?.message || errorData?.error;

    return detail
      ? String(detail)
      : `Server responded with status ${err.status}`;
  }

  // 2. Handle SerializedError (JS runtime/thrown exceptions)
  return err.message || "Something went wrong on our end.";
}

export function ErrorState({
  title = "Something went wrong",
  error,
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  const displayMessage = message || getErrorMessage(error);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mb-3 h-8 w-8 text-destructive" aria-hidden />
      <h3 className="font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {displayMessage}
      </p>
      {onRetry ? (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
