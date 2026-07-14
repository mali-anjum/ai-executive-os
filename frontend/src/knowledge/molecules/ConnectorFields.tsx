// common/molecules/integrations/ConnectorFields.tsx
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";
import { UseFormReturn } from 'react-hook-form';
import { IntegrationFormData, IntegrationFormErrors } from '@/knowledge/types/integrations';

interface ConnectorFieldsProps {
  form: UseFormReturn<IntegrationFormData>;
  errors: IntegrationFormErrors;
}

export function ConnectorFields({ form, errors }: ConnectorFieldsProps) {
  const { register } = form;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <IntegrationInput
        label="Notion page ID"
        register={register('notionPageId')}
        error={errors.notionPageId?.message}
        placeholder="Enter Notion page ID"
      />
      <IntegrationInput
        label="Google Drive file ID"
        register={register('driveFileId')}
        error={errors.driveFileId?.message}
        placeholder="Enter Google Drive file ID"
      />
    </div>
  );
}