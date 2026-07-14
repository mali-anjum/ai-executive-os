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
    form,
    formValues,
    message,
    busy,
    saveConfigs,
    runNotionSync,
    runDriveSync,
    runResyncAll,
  } = useIntegrations({ onSynced });

  const { errors } = form.formState;

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
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Department Scope */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Department scope for synced docs (optional)
            </p>
            <DepartmentPresetPicker 
              value={formValues.deptScope || ''} 
              onChange={(value) => form.setValue('deptScope', value)} 
            />
          </div>
          
          <IntegrationInput
            label="Custom departments (comma-separated)"
            register={form.register('deptScope')}
            placeholder="hr, engineering"
            error={errors.deptScope?.message}
          />

          {/* Settings Fields */}
          {settings && (
            <SettingsFields form={form} errors={errors} />
          )}

          {/* Connector Fields */}
          {connectors && (
            <ConnectorFields form={form} errors={errors} />
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
        </form>

        <IntegrationMessage message={message} />
      </CardContent>
    </Card>
  );
}