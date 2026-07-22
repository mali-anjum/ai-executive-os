"use client";

import type { ReactNode } from "react";
import type { Citation } from "@/common/api/client";
import {
  parseAssistantContent,
  splitAnswerLines,
} from "@/chat/lib/parseAssistantContent";
import { CitationRenderer } from "./CitationRenderer";
 
type AnswerWithCitationsProps = {
    content: string;
    citations?: Citation[];
    selectedKey?: string | null;
    onSelectCitation?: (citation: Citation) => void;
}

export function AnswerWithCitations({
  content,
  citations = [],
  selectedKey,
  onSelectCitation,
}: AnswerWithCitationsProps) {
  const { displayText } = parseAssistantContent(content);
  const lines = splitAnswerLines(displayText);

  const nodes: ReactNode[] = [];
  let bulletGroup: ReactNode[] = [];
  let bulletIndex = 0;

  const flushBullets = () => {
    if (bulletGroup.length) {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="list-disc space-y-2.5 pl-5">
          {bulletGroup}
        </ul>
      );
      bulletGroup = [];
    }
  };

  for (const line of lines) {
    if (line.kind === "blank") {
      flushBullets();
      continue;
    }

    const lineCitation =
      line.kind === "bullet" ? citations[bulletIndex] : undefined;

    const body = (
      <CitationRenderer
        text={line.text}
        citations={citations}
        lineCitation={lineCitation}
        selectedKey={selectedKey}
        onSelectCitation={onSelectCitation}
      />
    );

    if (line.kind === "bullet") {
      bulletGroup.push(
        <li key={`li-${bulletIndex}`} className="leading-relaxed">
          {body}
        </li>
      );
      bulletIndex += 1;
      continue;
    }

    flushBullets();
    nodes.push(
      <p key={`p-${nodes.length}`} className="leading-relaxed">
        {body}
      </p>
    );
  }
  flushBullets();

  return (
    <div className="space-y-2.5 text-sm text-card-foreground">{nodes}</div>
  );
}
