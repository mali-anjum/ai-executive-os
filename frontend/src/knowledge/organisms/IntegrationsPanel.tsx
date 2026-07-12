// common/organisms/integrations/IntegrationsPanel.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/atoms/ui/card";
import { DepartmentPresetPicker } from "@/knowledge/molecules/DepartmentPresetPicker";
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";
import { IntegrationButton } from "@/knowledge/atoms/IntegrationButton";
import { IntegrationMessage } from "@/knowledge/atoms/IntegrationMessage";
import { SettingsFields } from "@/knowledge/molecules/SettingsFields";
import { ConnectorFields } from "@/knowledge/molecules/ConnectorFields";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useIntegrations } from "@/knowledge/hooks/useIntegration";

interface IntegrationsPanelProps {
  onSynced?: () => void;
}

export function IntegrationsPanel({ onSynced }: IntegrationsPanelProps) {
  const connectors = useFeatureFlag("CONNECTOR_SYNC_ENABLED");
  const settings = useFeatureFlag("INTEGRATIONS_SETTINGS_ENABLED");
  
  const {
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
    setNotionToken,
    setDriveToken,
    setJiraSite,
    setJiraEmail,
    setJiraToken,
    setJiraProject,
    setNotionPageId,
    setDriveFileId,
    setDeptScope,
    saveConfigs,
    runNotionSync,
    runDriveSync,
    runResyncAll,
  } = useIntegrations({ onSynced });

  if (!connectors && !settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Connectors & integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sync Notion / Google Drive and configure Jira for approved tickets
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Department Scope */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Department scope for synced docs (optional)
          </p>
          <DepartmentPresetPicker value={deptScope} onChange={setDeptScope} />
        </div>
        
        <IntegrationInput
          label="Custom departments (comma-separated)"
          value={deptScope}
          onChange={setDeptScope}
          placeholder="hr, engineering"
        />

        {/* Settings Fields */}
        {settings && (
          <SettingsFields
            notionToken={notionToken}
            driveToken={driveToken}
            jiraSite={jiraSite}
            jiraEmail={jiraEmail}
            jiraToken={jiraToken}
            jiraProject={jiraProject}
            onNotionTokenChange={setNotionToken}
            onDriveTokenChange={setDriveToken}
            onJiraSiteChange={setJiraSite}
            onJiraEmailChange={setJiraEmail}
            onJiraTokenChange={setJiraToken}
            onJiraProjectChange={setJiraProject}
          />
        )}

        {/* Connector Fields */}
        {connectors && (
          <ConnectorFields
            notionPageId={notionPageId}
            driveFileId={driveFileId}
            onNotionPageIdChange={setNotionPageId}
            onDriveFileIdChange={setDriveFileId}
          />
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          {settings && (
            <IntegrationButton
              disabled={busy}
              onClick={saveConfigs}
            >
              Save credentials
            </IntegrationButton>
          )}
          
          {connectors && (
            <>
              <IntegrationButton
                variant="secondary"
                disabled={busy}
                onClick={runNotionSync}
              >
                Sync Notion
              </IntegrationButton>
              <IntegrationButton
                variant="secondary"
                disabled={busy}
                onClick={runDriveSync}
              >
                Sync Drive
              </IntegrationButton>
              <IntegrationButton
                variant="ghost"
                disabled={busy}
                onClick={runResyncAll}
              >
                Re-sync all
              </IntegrationButton>
            </>
          )}
        </div>

        <IntegrationMessage message={message} />
      </CardContent>
    </Card>
  );
}