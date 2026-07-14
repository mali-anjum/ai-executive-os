// common/molecules/integrations/SettingsFields.tsx
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";
import { UseFormReturn } from 'react-hook-form';
import { IntegrationFormData, IntegrationFormErrors } from '@/knowledge/types/integrations';

interface SettingsFieldsProps {
  form: UseFormReturn<IntegrationFormData>;
  errors: IntegrationFormErrors;
}

export function SettingsFields({ form, errors }: SettingsFieldsProps) {
  const { register } = form;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <IntegrationInput
        label="Notion API token"
        type="password"
        register={register('notionToken')}
        error={errors.notionToken?.message}
      />
      <IntegrationInput
        label="Google Drive access token"
        type="password"
        register={register('driveToken')}
        error={errors.driveToken?.message}
      />
      <IntegrationInput
        label="Jira site URL"
        register={register('jiraSite')}
        placeholder="https://yourorg.atlassian.net"
        error={errors.jiraSite?.message}
      />
      <IntegrationInput
        label="Jira email"
        register={register('jiraEmail')}
        error={errors.jiraEmail?.message}
      />
      <IntegrationInput
        label="Jira API token"
        type="password"
        register={register('jiraToken')}
        error={errors.jiraToken?.message}
      />
      <IntegrationInput
        label="Jira project key"
        register={register('jiraProject')}
        error={errors.jiraProject?.message}
      />
    </div>
  );
}