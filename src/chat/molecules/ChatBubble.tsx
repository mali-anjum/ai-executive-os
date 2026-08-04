"use client";

import type { Citation } from "@/common/api/client";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { cn } from "@/common/lib/utils";

import { AnswerWithCitations } from "@/chat/molecules/AnswerWithCitations";
import { RetrievalTracePanel } from "@/chat/molecules/RetrievalTracePanel";
import { BubbleFeedback } from "./BubbleFeedback";
import { BubbleConfidence } from "./BubbleConfidence";
import type { ChatMessageViewModel } from "@/chat/types/chat.types";

interface ChatBubbleProps {
  message: ChatMessageViewModel;
  userQuery?: string;
  selectedCitationKey?: string | null;
  onSelectCitation?: (citation: Citation) => void;
  onEscalate?: () => void;
}

export function ChatBubble({
  message,
  userQuery,
  selectedCitationKey,
  onSelectCitation,
  onEscalate,
}: ChatBubbleProps) {
  const traceEnabled = useFeatureFlag("RETRIEVAL_TRACE_ENABLED");
  const escalationEnabled = useFeatureFlag("CONFIDENCE_ESCALATION_ENABLED");

  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",

          isUser
            ? "bg-[linear-gradient(135deg,var(--accent-blue)_0%,var(--accent-ai)_100%)] text-white shadow-md"
            : "border border-border bg-card text-card-foreground",
        )}
      >
        <AnswerContent
          message={message}
          selectedCitationKey={selectedCitationKey}
          onSelectCitation={onSelectCitation}
        />

        {!isUser && message.confidence_score != null ? (
          <BubbleConfidence
            confidenceScore={message.confidence_score}
            escalated={message.escalated}
            userQuery={userQuery}
            onEscalate={onEscalate}
            escalationEnabled={escalationEnabled}
          />
        ) : null}

        {!isUser && message.query_log_id ? (
          <BubbleFeedback queryLogId={message.query_log_id} />
        ) : null}

        {!isUser && traceEnabled && message.retrieval_trace ? (
          <RetrievalTracePanel trace={message.retrieval_trace} />
        ) : null}

        {!isUser && message.citations && message.citations.length > 0 ? (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Click a <span className="font-bold underline">bold key term</span>{" "}
            or source icon to open references — use{" "}
            <span className="font-medium text-foreground">✕</span> to close
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AnswerContent({
  message,
  selectedCitationKey,
  onSelectCitation,
}: {
  message: ChatMessageViewModel;
  selectedCitationKey?: string | null;
  onSelectCitation?: (citation: Citation) => void;
}) {
  if (message.role === "user") {
    return <p className="whitespace-pre-wrap">{message.content || "…"}</p>;
  }

  return (
    <AnswerWithCitations
      content={message.content}
      citations={message.citations}
      selectedKey={selectedCitationKey}
      onSelectCitation={onSelectCitation}
    />
  );
}
