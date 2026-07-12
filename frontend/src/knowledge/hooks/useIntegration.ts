// common/hooks/useIntegrations.ts
import { useState, useCallback } from 'react';
import {
  useSyncNotionPageMutation,
  useSyncGoogleDriveFileMutation,
  useResyncAllConnectorsMutation,
} from '@/common/api/endpoints/connectors.api';
import { useSaveIntegrationConfigMutation } from '@/common/api/endpoints/settings.api';

interface UseIntegrationsProps {
  onSynced?: () => void;
}

export function useIntegrations({ onSynced }: UseIntegrationsProps = {}) {
  const [notionToken, setNotionToken] = useState("");
  const [driveToken, setDriveToken] = useState("");
  const [jiraSite, setJiraSite] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProject, setJiraProject] = useState("OPS");
  const [notionPageId, setNotionPageId] = useState("");
  const [driveFileId, setDriveFileId] = useState("");
  const [deptScope, setDeptScope] = useState("");
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

  const getDeptList = useCallback(() => {
    return deptScope
      ? deptScope
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : undefined;
  }, [deptScope]);

  const saveConfigs = useCallback(async () => {
    setMessage(null);
    try {
      if (notionToken) {
        await saveIntegrationConfig({
          provider: "notion",
          config: { api_token: notionToken },
        }).unwrap();
      }
      if (driveToken) {
        await saveIntegrationConfig({
          provider: "google_drive",
          config: { api_token: driveToken },
        }).unwrap();
      }
      if (jiraSite && jiraEmail && jiraToken) {
        await saveIntegrationConfig({
          provider: "jira",
          config: {
            site_url: jiraSite,
            email: jiraEmail,
            api_token: jiraToken,
            project_key: jiraProject,
          },
        }).unwrap();
      }
      setMessage("Integration credentials saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }, [
    notionToken,
    driveToken,
    jiraSite,
    jiraEmail,
    jiraToken,
    jiraProject,
    saveIntegrationConfig,
  ]);

  const runNotionSync = useCallback(async () => {
    if (!notionPageId) return;
    setMessage(null);
    try {
      await syncNotionPage({
        pageId: notionPageId,
        allowedDepartments: getDeptList(),
      }).unwrap();
      setMessage("Notion page queued for indexing.");
      onSynced?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Notion sync failed");
    }
  }, [notionPageId, getDeptList, syncNotionPage, onSynced]);

  const runDriveSync = useCallback(async () => {
    if (!driveFileId) return;
    setMessage(null);
    try {
      await syncGoogleDriveFile({
        fileId: driveFileId,
        allowedDepartments: getDeptList(),
      }).unwrap();
      setMessage("Google Drive file queued for indexing.");
      onSynced?.();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Drive sync failed");
    }
  }, [driveFileId, getDeptList, syncGoogleDriveFile, onSynced]);

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
    // State
    notionToken,
    driveToken,
    jiraSite,
    jiraEmail,
    jiraToken,
    jiraProject,
    notionPageId,
    driveFileId,
    deptScope,
    message,
    busy,
    
    // Setters
    setNotionToken,
    setDriveToken,
    setJiraSite,
    setJiraEmail,
    setJiraToken,
    setJiraProject,
    setNotionPageId,
    setDriveFileId,
    setDeptScope,
    setMessage,
    
    // Actions
    saveConfigs,
    runNotionSync,
    runDriveSync,
    runResyncAll,
  };
}