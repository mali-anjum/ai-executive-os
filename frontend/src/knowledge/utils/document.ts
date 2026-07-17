import { DocumentRecord } from "@/common/types";

export function documentsFingerprint(
    docs: readonly DocumentRecord[],
  ): string {
    return docs
      .map(({ id, updated_at }) => `${id}:${updated_at}`)
      .join("|");
  }