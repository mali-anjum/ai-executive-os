"use client";

import type { Citation } from "@/common/api/client";
import { AnswerWithCitations } from "@/chat/molecules/AnswerWithCitations";


interface BubbleContentProps {
  role: "user" | "assistant";

  content: string;

  citations?: Citation[];

  selectedCitationKey?: string | null;

  onSelectCitation?: (
    citation: Citation
  ) => void;
}


export function BubbleContent({
  role,
  content,
  citations,
  selectedCitationKey,
  onSelectCitation,
}: BubbleContentProps) {

  const isUser = role === "user";


  if (isUser) {
    return (
      <p className="whitespace-pre-wrap">
        {content || "…"}
      </p>
    );
  }


  return (
    <AnswerWithCitations
      content={content}
      citations={citations}
      selectedKey={selectedCitationKey}
      onSelectCitation={onSelectCitation}
    />
  );
}