// common/molecules/integrations/SettingsFields.tsx
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";

interface SettingsFieldsProps {
  notionToken: string;
  driveToken: string;
  jiraSite: string;
  jiraEmail: string;
  jiraToken: string;
  jiraProject: string;
  onNotionTokenChange: (value: string) => void;
  onDriveTokenChange: (value: string) => void;
  onJiraSiteChange: (value: string) => void;
  onJiraEmailChange: (value: string) => void;
  onJiraTokenChange: (value: string) => void;
  onJiraProjectChange: (value: string) => void;
}

export function SettingsFields({
  notionToken,
  driveToken,
  jiraSite,
  jiraEmail,
  jiraToken,
  jiraProject,
  onNotionTokenChange,
  onDriveTokenChange,
  onJiraSiteChange,
  onJiraEmailChange,
  onJiraTokenChange,
  onJiraProjectChange,
}: SettingsFieldsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <IntegrationInput
        label="Notion API token"
        type="password"
        value={notionToken}
        onChange={onNotionTokenChange}
      />
      <IntegrationInput
        label="Google Drive access token"
        type="password"
        value={driveToken}
        onChange={onDriveTokenChange}
      />
      <IntegrationInput
        label="Jira site URL"
        value={jiraSite}
        onChange={onJiraSiteChange}
        placeholder="https://yourorg.atlassian.net"
      />
      <IntegrationInput
        label="Jira email"
        value={jiraEmail}
        onChange={onJiraEmailChange}
      />
      <IntegrationInput
        label="Jira API token"
        type="password"
        value={jiraToken}
        onChange={onJiraTokenChange}
      />
      <IntegrationInput
        label="Jira project key"
        value={jiraProject}
        onChange={onJiraProjectChange}
      />
    </div>
  );
}