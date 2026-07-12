// common/atoms/integrations/IntegrationMessage.tsx
interface IntegrationMessageProps {
    message: string | null;
  }
  
  export function IntegrationMessage({ message }: IntegrationMessageProps) {
    if (!message) return null;
    return <p className="text-sm text-muted-foreground">{message}</p>;
  }