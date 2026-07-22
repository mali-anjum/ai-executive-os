import { cn } from "@/common/lib/utils";
import { Citation } from "@/common/types";

/** Only the key term is bold + underlined + clickable — body text stays plain. */
export function ClickableKeyTerm({
    term,
    citation,
    isActive,
    onSelectCitation,
  }: {
    term: string;
    citation: Citation;
    isActive: boolean;
    onSelectCitation?: (citation: Citation) => void;
  }) {
    const label = term.endsWith(":") ? term : term;
    return (
      <button
        type="button"
        onClick={() => onSelectCitation?.(citation)}
        className={cn(
          "inline cursor-pointer align-baseline font-bold text-foreground",
          "underline decoration-accent-ai decoration-2 underline-offset-[3px]",
          "hover:bg-accent-ai/10",
          isActive && "rounded-sm bg-accent-ai/15 ring-1 ring-accent-ai/40"
        )}
        title={`${citation.document_name}${
          citation.page_number != null ? ` · page ${citation.page_number}` : ""
        }`}
      >
        {label}
      </button>
    );
  }