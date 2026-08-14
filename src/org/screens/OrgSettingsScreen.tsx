"use client";

import { useState } from "react";
import { Button } from "@/common/atoms/Button";
import { Input } from "@/common/atoms/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/atoms/ui/card";
import { LoadingBlock } from "@/common/molecules/LoadingBlock";
import { DashboardTemplate } from "@/common/organisms/DashboardTemplate";
import { useOrgData } from "@/org/hooks/useOrgData";
import { useRole } from "@/common/hooks/useRole";
import type { OrganizationRecord } from "@/common/types";

function OrgSettingsForm({ org }: { org: OrganizationRecord }) {
  const { saveOrg } = useOrgData();

  // Initialized from the loaded org; remounted via key when the org changes.
  const [name, setName] = useState(org.name ?? "");
  const [industry, setIndustry] = useState(org.industry ?? "");
  const [website, setWebsite] = useState(org.website ?? "");
  const [timezone, setTimezone] = useState(org.timezone ?? "UTC");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveOrg({ name: name.trim(), industry, website, timezone });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <p className="text-sm text-muted-foreground">
          These details are shared with your whole workspace.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input label="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        <Input label="Website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        <div className="flex items-center gap-3">
          <Button onClick={save} isLoading={saving} disabled={!name.trim()}>
            Save changes
          </Button>
          {saved ? <span className="text-sm text-success">Saved.</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrgSettingsScreen() {
  const { isAdmin } = useRole();
  const { org, isLoading } = useOrgData();

  if (!isAdmin) {
    return (
      <DashboardTemplate title="Organization settings">
        <p className="text-sm text-muted-foreground">
          Only owners and admins can edit organization settings.
        </p>
      </DashboardTemplate>
    );
  }

  return (
    <DashboardTemplate title="Organization settings">
      <div className="mx-auto max-w-2xl">
        {isLoading || !org ? (
          <LoadingBlock />
        ) : (
          <OrgSettingsForm key={org.id} org={org} />
        )}
      </div>
    </DashboardTemplate>
  );
}

