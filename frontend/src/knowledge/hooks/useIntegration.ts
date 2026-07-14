// common/hooks/useIntegrations.ts
import { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSyncNotionPageMutation,
  useSyncGoogleDriveFileMutation,
  useResyncAllConnectorsMutation,
} from '@/common/api/endpoints/connectors.api';
import { useSaveIntegrationConfigMutation } from '@/common/api/endpoints/settings.api';
import { integrationSchema, type IntegrationFormData } from '@/knowledge/types/integrations';

interface UseIntegrationsProps {
  onSynced?: () => void;
}

export function useIntegrations({ onSynced }: UseIntegrationsProps = {}) {
  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      notionToken: "",
      driveToken: "",
      jiraSite: "",
      jiraEmail: "",
      jiraToken: "",
      jiraProject: "OPS",
      notionPageId: "",
      driveFileId: "",
      deptScope: "",
    },
    mode: 'onChange',
  });

  const [message, setMessage] = useState<string | null>(null);

  const [saveIntegrationConfig, { isLoading: isSavingIntegration }] = 
    useSaveIntegrationConfigMutation();
  
  const [syncNotionPage, { isLoading: isSyncingNotion }] = 
    useSyncNotionPageMutation();
  
  const [syncGoogleDriveFile, { isLoading: isSyncingDrive }] = 
    useSyncGoogleDriveFileMutation();
  
  const [resyncAllConnectors, { isLoading: isResyncingAll }] = 
    useResyncAllConnectorsMutation();

  const busy = isSavingIntegration || isSyncingNotion || isSyncingDrive || isResyncingAll;
  const deptScope = useWatch({
    control: form.control,
    name: "deptScope",
  });

  const getDeptList = useCallback((deptScope: string) => {
    return deptScope
      ? deptScope
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : undefined;
  }, []);

  const saveConfigs = useCallback(async (data: IntegrationFormData) => {
    setMessage(null);
    try {
      if (data.notionToken) {
        await saveIntegrationConfig({
          provider: "notion",
          config: { api_token: data.notionToken },
        }).unwrap();
      }
      if (data.driveToken) {
        await saveIntegrationConfig({
          provider: "google_drive",
          config: { api_token: data.driveToken },
        }).unwrap();
      }
      if (data.jiraSite && data.jiraEmail && data.jiraToken) {
        await saveIntegrationConfig({
          provider: "jira",
          config: {
            site_url: data.jiraSite,
            email: data.jiraEmail,
            api_token: data.jiraToken,
            project_key: data.jiraProject || "OPS",
          },
        }).unwrap();
      }
      setMessage("Integration credentials saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }, [saveIntegrationConfig]);

  const runNotionSync = useCallback(async (data: IntegrationFormData) => {
    if (!data.notionPageId) return;
    setMessage(null);
    try {
      await syncNotionPage({
        pageId: data.notionPageId,
        allowedDepartments: getDeptList(data.deptScope || ''),
      }).unwrap();
      setMessage("Notion page queued for indexing.");
      onSynced?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Notion sync failed");
    }
  }, [syncNotionPage, getDeptList, onSynced]);

  const runDriveSync = useCallback(async (data: IntegrationFormData) => {
    if (!data.driveFileId) return;
    setMessage(null);
    try {
      await syncGoogleDriveFile({
        fileId: data.driveFileId,
        allowedDepartments: getDeptList(data.deptScope || ''),
      }).unwrap();
      setMessage("Google Drive file queued for indexing.");
      onSynced?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Drive sync failed");
    }
  }, [syncGoogleDriveFile, getDeptList, onSynced]);

  const runResyncAll = useCallback(async () => {
    setMessage(null);
    try {
      await resyncAllConnectors().unwrap();
      setMessage("All connectors queued for re-sync.");
      onSynced?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Re-sync failed");
    }
  }, [resyncAllConnectors, onSynced]);

  return {
    form,
    deptScope,
    message,
    busy,
    setMessage,
    saveConfigs: form.handleSubmit(saveConfigs),
    runNotionSync: form.handleSubmit(runNotionSync),
    runDriveSync: form.handleSubmit(runDriveSync),
    runResyncAll,
  };
}

export type { IntegrationFormData };