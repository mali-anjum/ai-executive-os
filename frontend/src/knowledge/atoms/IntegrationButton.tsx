// common/atoms/integrations/IntegrationButton.tsx
import { Button } from "@/common/atoms/ui/button";

interface IntegrationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "secondary" | "ghost";
  children: React.ReactNode;
}

export function IntegrationButton({
  onClick,
  disabled,
  variant = "default",
  children,
}: IntegrationButtonProps) {
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}