import { Citation } from "@/common/types";
import { buildCitedPassages, citationKey, CitedPassage, hasInlineCitationMarkers } from "../lib/parseAssistantContent";
import { CitationText } from "../atoms/CitationText";
import { CitationMarker } from "../atoms/CitationMarker";
import { PlainLineText } from "../atoms/PlainLineText";


export function CitationRenderer({
    text,
    citations,
    lineCitation,
    selectedKey,
    onSelectCitation,
  }: {
    text: string;
    citations: Citation[];
    lineCitation?: Citation;
    selectedKey?: string | null;
    onSelectCitation?: (citation: Citation) => void;
  }) {
    if (lineCitation && !hasInlineCitationMarkers(text)) {
      const label = String(
        lineCitation.citation_index ?? citations.indexOf(lineCitation) + 1
      );
      return (
        <CitationText
          text={text}
          citation={lineCitation}
          markerLabel={label}
          selectedKey={selectedKey}
          onSelectCitation={onSelectCitation}
        />
      );
    }
  
    const passages = buildCitedPassages(text, citations);
  
    return (
      <>
        {passages.map((block, i) => {
          if ("type" in block && block.type === "plain") {
            return <PlainLineText key={i} text={block.text} />;
          }
  
          const passage = block as CitedPassage;
          if (!passage.text && passage.citation) {
            return (
              <CitationMarker
                key={i}
                label={passage.markerLabel}
                isActive={selectedKey === citationKey(passage.citation)}
                onClick={() => onSelectCitation?.(passage.citation!)}
              />
            );
          }
  
          return (
            <CitationText
              key={i}
              text={passage.text}
              citation={passage.citation}
              markerLabel={passage.citation ? passage.markerLabel : undefined}
              selectedKey={selectedKey}
              onSelectCitation={onSelectCitation}
            />
          );
        })}
      </>
    );
  }