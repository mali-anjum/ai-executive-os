import { Citation } from "@/common/types";
import { citationKey, splitBoldSpans, stripInlineCitationMarkers } from "../lib/parseAssistantContent";
import { ClickableKeyTerm } from "./ClickableKeyterm";
import { CitationMarker } from "./CitationMarker";
import { PlainLineText } from "./PlainLineText";

export function CitationText({
    text,
    citation,
    markerLabel,
    selectedKey,
    onSelectCitation,
  }: {
    text: string;
    citation?: Citation;
    markerLabel?: string;
    selectedKey?: string | null;
    onSelectCitation?: (citation: Citation) => void;
  }) {
    const displayText = stripInlineCitationMarkers(text);
    const isActive = citation && selectedKey === citationKey(citation);
  
    const spans = splitBoldSpans(displayText);
    const hasBold = spans.some((s) => s.bold);
  
    if (citation && hasBold) {
      return (
        <span className="inline">
          {spans.map((span, i) =>
            span.bold ? (
              <ClickableKeyTerm
                key={i}
                term={span.value}
                citation={citation}
                isActive={Boolean(isActive)}
                onSelectCitation={onSelectCitation}
              />
            ) : (
              <span key={i}>{span.value}</span>
            )
          )}
          {markerLabel ? (
            <CitationMarker
              label={markerLabel}
              isActive={Boolean(isActive)}
              onClick={() => onSelectCitation?.(citation)}
            />
          ) : null}
        </span>
      );
    }
  
    if (citation) {
      const colonMatch = displayText.match(/^([^:]{2,80}):\s*([\s\S]*)$/);
      if (colonMatch) {
        return (
          <span className="inline">
            <ClickableKeyTerm
              term={`${colonMatch[1]}:`}
              citation={citation}
              isActive={Boolean(isActive)}
              onSelectCitation={onSelectCitation}
            />
            <span>{colonMatch[2]}</span>
            {markerLabel ? (
              <CitationMarker
                label={markerLabel}
                isActive={Boolean(isActive)}
                onClick={() => onSelectCitation?.(citation)}
              />
            ) : null}
          </span>
        );
      }
    }
  
    return (
      <span className="inline">
        <PlainLineText text={displayText} />
        {citation && markerLabel ? (
          <CitationMarker
            label={markerLabel}
            isActive={Boolean(isActive)}
            onClick={() => onSelectCitation?.(citation)}
          />
        ) : null}
      </span>
    );
  }
  