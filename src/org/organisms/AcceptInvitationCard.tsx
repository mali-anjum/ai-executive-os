"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/common/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/atoms/ui/card";
import { useAcceptInvitation } from "@/org/hooks/useAcceptInvitation";

/**
 * Rendered after authentication when the user's email has a pending invitation.
 * Accepting joins the existing organization (never creates a new one) and syncs
 * the Supabase user_metadata so RLS scopes subsequent requests to that tenant.
 *
 * The target org id comes from the invite link (`?org=<org_id>`); the RPC
 * validates the pending invitation for the caller's email in that org.
 */
export function AcceptInvitationCard({ targetOrgId }: { targetOrgId?: string }) {
  const router = useRouter();
  const { state, accept } = useAcceptInvitation();

  if (state.status === "accepted") {
    router.replace("/dashboard");
    router.refresh();
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;ve been invited to a workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          An organization has invited you to join their team. Accept to enter your
          team&apos;s workspace.
        </p>
        {state.status === "error" ? (
          <p className="text-sm text-destructive">{state.message}</p>
        ) : null}
        {!targetOrgId ? (
          <p className="text-sm text-muted-foreground">
            Invitation link is missing the workspace id. Use the link from your
            invitation email.
          </p>
        ) : (
          <Button
            onClick={() => void accept(targetOrgId)}
            isLoading={state.status === "checking"}
          >
            Accept invitation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

