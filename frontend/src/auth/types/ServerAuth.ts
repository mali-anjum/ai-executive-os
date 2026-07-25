export type ServerAuth = {
    user: {
      email: string | null;
      id: string;
      role: string;
    } | null;
    org: {
      orgId: string | null;
      orgName: string | null;
    } | null;
  };