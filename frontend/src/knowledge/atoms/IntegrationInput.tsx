import { Input } from "@/common/atoms/ui/input";
import { UseFormRegisterReturn } from 'react-hook-form';

interface IntegrationInputProps {
  label: string;
  register?: UseFormRegisterReturn;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export function IntegrationInput({
  label,
  register,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required = false,
}: IntegrationInputProps) {
  // If register is provided, use it; otherwise use controlled props
  const inputProps = register || {
    value,
    onChange: onChange ? (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined,
  };

  return (
    <div className="space-y-1">
      <Input
        label={label}
        type={type}
        placeholder={placeholder}
        required={required}
        {...inputProps}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}