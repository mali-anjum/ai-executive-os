"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/common/atoms/Button";
import { Input } from "@/common/atoms/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/atoms/ui/card";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { useOrgData } from "@/org/hooks/useOrgData";
import { useTeam } from "@/org/hooks/useTeam";
import { InviteMembersForm } from "@/org/molecules/InviteMembersForm";
import { useRole } from "@/common/hooks/useRole";
import { invitableRolesFor } from "@/org/services/invitation-validation";

const STEPS = [
  { title: "Organization details", description: "Confirm your workspace identity." },
  { title: "Invite your team", description: "Bring teammates and assign roles." },
  { title: "Integrations", description: "Optional — skip for now." },
] as const;

/**
 * Owner onboarding. Optional steps (integrations) are skippable. Invited users
 * join an existing organization and skip this flow entirely.
 */
export function OnboardingScreen() {
  const router = useRouter();
  const { isAdmin } = useRole();
  const { org, saveOrg, finishOnboarding } = useOrgData();
  const { invite } = useTeam();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(org?.name ?? "");
  const [industry, setIndustry] = useState(org?.industry ?? "");
  const [website, setWebsite] = useState(org?.website ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <DashboardTemplate title="Onboarding">
        <p className="text-sm text-muted-foreground">
          You do not have permission to run organization onboarding.
        </p>
      </DashboardTemplate>
    );
  }

  const saveDetails = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveOrg({ name: name.trim(), industry, website });
      setStep(1);
    } catch {
      setError("Could not save organization details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    try {
      await finishOnboarding("onboarding");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not finish onboarding.");
    }
  };

  return (
    <DashboardTemplate title="Set up your organization">
      <div className="mx-auto max-w-2xl">
        <ol className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${
                  i === step ? "bg-accent-blue/20 text-accent-blue" : "bg-muted"
                }`}
              >
                {i + 1}
              </span>
              <span>{s.title}</span>
              {i < STEPS.length - 1 ? <span className="text-border">→</span> : null}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[0].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Industry (optional)" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              <Input label="Website (optional)" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button onClick={saveDetails} isLoading={saving} disabled={!name.trim()}>
                Continue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <InviteMembersForm
              onInvite={async (body) => {
                await invite(body);
              }}
              invitableRoles={invitableRolesFor("owner")}
            />
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Skip for now</Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Optional integrations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Connectors (Jira, Notion, Google Drive) are available later from
                Settings. This step is optional.
              </p>
            </CardHeader>
            <CardContent className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={finish}>Enter workspace</Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardTemplate>
  );
}
