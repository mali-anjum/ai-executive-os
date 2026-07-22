"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/common/atoms/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/atoms/ui/card";

import { useSeedDemoTenantMutation } from "@/common/api/endpoints/demo.api";
import { useFeatureFlag } from "@/common/hooks/useFeatureFlag";
import { useRole } from "@/common/hooks/useRole";
import { getApiErrorMessage } from "@/common/api/errorMessage";

export function DemoSeedCard({
  onSeeded,
}: {
  onSeeded?: () => void;
}) {
  const enabled = useFeatureFlag("DEMO_TENANT_ENABLED");
  const { isAdmin } = useRole();

  const [message, setMessage] = useState<string | null>(null);

  const [
    seedDemoTenant,
    {
      isLoading,
    },
  ] = useSeedDemoTenantMutation();

  if (!enabled || !isAdmin) {
    return null;
  }

  async function runSeed() {
    setMessage(null);

    try {
      const response = await seedDemoTenant().unwrap();

      setMessage(response.message);

      onSeeded?.();
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <Card className="border-accent-ai/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 text-accent-ai"
            aria-hidden
          />

          <CardTitle className="text-base">
            One-click demo tenant
          </CardTitle>
        </div>

        <p className="text-sm text-muted-foreground">
          Load sample SOPs, queries, and tickets for an instant client demo
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button
          disabled={isLoading}
          onClick={() => void runSeed()}
        >
          {isLoading ? "Seeding…" : "Seed demo data"}
        </Button>

        {message && (
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}