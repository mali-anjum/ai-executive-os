// common/molecules/integrations/SettingsFields.tsx
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";
import { UseFormReturn } from 'react-hook-form';
import { IntegrationFormData, IntegrationFormErrors } from '@/knowledge/types/integrations';

interface SettingsFieldsProps {
  form: UseFormReturn<IntegrationFormData>;
  errors: IntegrationFormErrors;
}

export function SettingsFields({ form, errors }: SettingsFieldsProps) {

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <IntegrationInput
        label="Notion API token"
        type="password"
        register={form.register('notionToken')}
        error={errors.notionToken?.message}
      />
      <IntegrationInput
        label="Google Drive access token"
        type="password"
        register={form.register('driveToken')}
        error={errors.driveToken?.message}
      />
      <IntegrationInput
        label="Jira site URL"
        register={form.register('jiraSite')}
        placeholder="https://yourorg.atlassian.net"
        error={errors.jiraSite?.message}
      />
      <IntegrationInput
        label="Jira email"
        register={form.register('jiraEmail')}
        error={errors.jiraEmail?.message}
      />
      <IntegrationInput
        label="Jira API token"
        type="password"
        register={form.register('jiraToken')}
        error={errors.jiraToken?.message}
      />
      <IntegrationInput
        label="Jira project key"
        register={form.register('jiraProject')}
        error={errors.jiraProject?.message}
      />
    </div>
  );
}