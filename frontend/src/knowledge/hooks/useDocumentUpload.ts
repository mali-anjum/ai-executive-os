"use client";

import { useCallback, useRef } from "react";
import { documentsPolling } from "@/common/config/polling.config";
import { useVisibilityPolling } from "@/common/hooks/useVisibilityPolling";
import { isApiUnreachableError } from "@/common/api/fetch";
import {
  useListDocumentsQuery,
  useUploadDocumentMutation, 
} from "@/common/api/endpoints/knowledge.api";
import { type UploadDocumentRequest } from "@/common/types/knowledge";
import { isDocumentProcessing} from "@/common/types";
import { useAppDispatch, useAppSelector } from "@/common/store/hooks";
import {
  clearDocumentsFetchError,
  setDocuments,
  setDocumentsFetchError,
  setDocumentsLoading,
  setUploadError,
  setUploading,
} from "@/knowledge/state/knowledgeSlice";
import { documentsFingerprint } from "@/knowledge/utils/document";
import { getApiErrorMessage } from "@/common/api/errors/getApiErrorMessage";
import { toast } from "@/common/lib/toast";

type RefreshOptions = {
  background?: boolean;
};

export function useDocumentUpload() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((s) => s.knowledge.documents);
  const isUploading = useAppSelector((s) => s.knowledge.isUploading);
  const isLoading = useAppSelector((s) => s.knowledge.isLoading);
  const error = useAppSelector((s) => s.knowledge.error);
  const apiUnreachable = useAppSelector((s) => s.knowledge.apiUnreachable);
  const lastFingerprint = useRef("");
  const hasShownInitialLoading = useRef(true);

  const { data: listDocuments} = useListDocumentsQuery();
  const [uploadDocument] = useUploadDocumentMutation();

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      const background = options?.background ?? false;
      if (!background && hasShownInitialLoading.current) {
        hasShownInitialLoading.current = false;
        dispatch(setDocumentsLoading(true));
      }
      try {
        const docs = await listDocuments().unwrap();
        // Avoid dispatching Redux updates when document state hasn't changed.
        const fp = documentsFingerprint(docs); 
        if (fp !== lastFingerprint.current) {
          lastFingerprint.current = fp;
          dispatch(setDocuments(docs));
        } else {
          dispatch(clearDocumentsFetchError());
        }
      } catch (e) {
        dispatch(
          setDocumentsFetchError({
            error: getApiErrorMessage(e) ?? "Failed to load documents",
            apiUnreachable: isApiUnreachableError(e),
          }),
        );
      } finally {
        dispatch(setDocumentsLoading(false));
      }
    },
    [dispatch, listDocuments],
  );

  const hasProcessing = documents.some((d) => isDocumentProcessing(d.status));

  useVisibilityPolling({
    enabled: !apiUnreachable,
    onPoll: () => {
      void refresh({
        background: !hasShownInitialLoading.current,
      });
    },
    intervalMs: documentsPolling.intervalMs,
    fastIntervalMs: documentsPolling.fastIntervalMs,
    fastDurationMs: documentsPolling.fastDurationMs,
    getIntervalMs: () =>
      hasProcessing
        ? documentsPolling.activeIntervalMs
        : documentsPolling.intervalMs,
  });

  const upload = useCallback(
    async (request: UploadDocumentRequest) => {
      if (isUploading) {
        toast.info("A document upload is already in progress.");
        return;
      }
  
      dispatch(setUploading(true));
      dispatch(clearDocumentsFetchError());
  
      try {
        await uploadDocument(request).unwrap();
        await refresh({ background: true });
      } catch (e) {
        dispatch(
          setUploadError(getApiErrorMessage(e))
        );
      } finally {
        dispatch(setUploading(false));
      }
    },
    [dispatch, isUploading, refresh, uploadDocument],
  );

  return {
    documents,
    isUploading,
    isLoading,
    error,
    apiUnreachable,
    upload,
    refresh,
  };
}
