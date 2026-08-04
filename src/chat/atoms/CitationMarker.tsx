import { cn } from "@/common/lib/utils";
import { FileText } from "lucide-react";

export function CitationMarker({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "ml-1 inline-flex h-4.5 min-w-4.5 items-center justify-center gap-0.5 rounded-full px-1.5 align-baseline text-[10px] font-bold leading-none transition-colors",
          isActive
            ? "bg-accent-ai text-white"
            : "bg-accent-ai/20 text-accent-ai hover:bg-accent-ai/35",
          onClick && "cursor-pointer"
        )}
        title="View source"
        aria-label={`Source ${label}`}
      >
        <FileText className="h-2.5 w-2.5" aria-hidden />
        <span>{label}</span>
      </button>
    );
  }