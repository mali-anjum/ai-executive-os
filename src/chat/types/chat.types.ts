import { Citation, RetrievalTrace } from "@/common/types";

export interface ChatMessageViewModel {
    id:string;
    role:"user"|"assistant";
    content:string;
    citations?:Citation[];
    confidence_score?:number|null;
    escalated?:boolean;
    query_log_id?:string|null;
    retrieval_trace?:RetrievalTrace|null;
  }