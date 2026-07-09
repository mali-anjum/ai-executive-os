export const API_TAGS = {
    DOCUMENTS: 'documents',
    TICKETS: 'tickets',
    ANALYTICS: 'analytics',
    EVALUATION: 'evaluation',
    QUERY: 'query',
    INTEGRATIONS: 'integrations',
    SETTINGS: 'settings',
    DEMO: 'demo',
    CONNECTORS: 'connectors',
  } as const;
  
  export type ApiTag = typeof API_TAGS[keyof typeof API_TAGS];