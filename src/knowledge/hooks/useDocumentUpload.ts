"use client";

import { useCallback, useEffect } from "react";
import {
  useListDocumentsQuery,
  useUploadDocumentMutation,
} from "@/common/api/endpoints/knowledge.api";
import type { UploadDocumentRequest } from "@/common/types/knowledge";
import { isDocumentProcessing } from "@/common/types";
import { isApiUnreachableError } from "@/common/api";
import { getApiErrorMessage } from "@/common/api/errors/getApiErrorMessage";
import { toast } from "@/common/lib/toast";

type UseDocumentUploadOptions = {
  pollingEnabled?: boolean;
};

type RefreshOptions = {
  background?: boolean;
};

export function useDocumentUpload(options?: UseDocumentUploadOptions) {
  const pollingEnabled = options?.pollingEnabled ?? true;

  const {
    data: documents = [],
    error: documentsError,
    isLoading,
    isFetching,
    refetch,
  } = useListDocumentsQuery(undefined, {
    pollingInterval: pollingEnabled ? 15000 : 0,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const apiUnreachable = isApiUnreachableError(documentsError);

  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      const shouldRefreshInBackground = options?.background ?? false;

      if (shouldRefreshInBackground) {
        await refetch();
        return;
      }

      await refetch();
    },
    [refetch],
  );

  /**
   * Upload document and refresh cache.
   *
   * RTK Query invalidation should normally refresh this automatically,
   * but explicit refetch guarantees fresh processing status after upload.
   */
  const upload = useCallback(
    async (request: UploadDocumentRequest) => {
      if (isUploading) {
        toast.info("A document upload is already in progress.");
        return;
      }

      try {
        await uploadDocument(request).unwrap();

        toast.success("Document uploaded successfully.");

        await refresh({ background: true });
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    },
    [uploadDocument, isUploading, refresh],
  );
  
  const hasProcessing = documents.some((document) =>
    isDocumentProcessing(document.status),
  );

  /**
   * Increase refresh frequency while
   * documents are being processed.
   *
   * Uses RTK Query's own polling lifecycle.
   */
  useEffect(() => {
    if (!hasProcessing) {
      return;
    }

    const interval = setInterval(() => {
      void refetch();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [hasProcessing, refetch]);

  return {
    documents,
    isLoading,
    isFetching,
    isUploading,
    hasProcessing,
    apiUnreachable,
    error: documentsError,
    upload,
    refresh,
  };
}
