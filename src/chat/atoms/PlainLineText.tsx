import { splitBoldSpans } from "@/chat/lib/parseAssistantContent";

export function PlainLineText({ text }: { text: string }) {
    return (
      <>
        {splitBoldSpans(text).map((span, i) =>
          span.bold ? (
            <strong key={i} className="font-bold text-foreground">
              {span.value}
            </strong>
          ) : (
            <span key={i}>{span.value}</span>
          )
        )}
      </>
    );
  }