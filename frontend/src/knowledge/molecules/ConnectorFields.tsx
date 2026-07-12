// common/molecules/integrations/ConnectorFields.tsx
import { IntegrationInput } from "@/knowledge/atoms/IntegrationInput";

interface ConnectorFieldsProps {
  notionPageId: string;
  driveFileId: string;
  onNotionPageIdChange: (value: string) => void;
  onDriveFileIdChange: (value: string) => void;
}

export function ConnectorFields({
  notionPageId,
  driveFileId,
  onNotionPageIdChange,
  onDriveFileIdChange,
}: ConnectorFieldsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <IntegrationInput
        label="Notion page ID"
        value={notionPageId}
        onChange={onNotionPageIdChange}
      />
      <IntegrationInput
        label="Google Drive file ID"
        value={driveFileId}
        onChange={onDriveFileIdChange}
      />
    </div>
  );
}