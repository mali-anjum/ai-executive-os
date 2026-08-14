"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/common/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/atoms/ui/card";
import { useAcceptInvitation } from "@/org/hooks/useAcceptInvitation";

/**
 * Rendered after authentication when the user's email has a pending invitation.
 * Accepting joins the existing organization (never creates a new one) and syncs
 * the Supabase user_metadata so RLS scopes subsequent requests to that tenant.
 */
export function AcceptInvitationCard() {
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
        <Button onClick={() => void accept()} isLoading={state.status === "checking"}>
          Accept invitation
        </Button>
        {state.status === "none" ? (
          <p className="text-xs text-muted-foreground">
            No pending invitation found for your email.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
