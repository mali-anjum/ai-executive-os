// common/atoms/integrations/IntegrationInput.tsx
import { Input } from "@/common/atoms/ui/input";

interface IntegrationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export function IntegrationInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: IntegrationInputProps) {
  return (
    <Input
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}