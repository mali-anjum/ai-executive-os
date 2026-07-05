"use client";

import { AIStatusPanel } from "@/dashboard/molecules/AIStatusPanel";
import { QuickActions } from "@/dashboard/molecules/QuickActions";
import { useRole } from "@/common/hooks/useRole";
import { EmployeeWelcome } from "@/dashboard/atoms/EmployeeWelcome";
import { ManagerWelcome } from "@/dashboard/atoms/ManagerWelcome";
import { LeadershipDashboard } from "@/dashboard/organisms/LeaderShipBoard";
import { useExecutiveSummary } from "@/dashboard/hooks/useExecutiveSummary";
import { Skeleton } from "@/common/atoms/ui/skeleton";

export function DashboardScreen() {
  const { isAdmin, isManager, isLeadership } = useRole();
  const { summary: executiveSummary, error, loading} = useExecutiveSummary();

    if (loading) {
      return <DashboardSkeleton />
    }
  
    if (error) {
      return <div>Error loading data: {error}</div>;
    }
  
  if (!isLeadership) {
    return (
      <div className="space-y-6">
        <EmployeeWelcome />
        <div className="grid gap-6 lg:grid-cols-2">
          <AIStatusPanel />
          <QuickActions />
        </div>
      </div>
    );
  }

  if (isManager && !isAdmin) {
    return (
      <div className="space-y-6">
        <ManagerWelcome />
        <LeadershipDashboard 
          showDemoSeed={false} 
          executiveSummary={executiveSummary} 
        />
      </div>
    );
  }

  return (
    <LeadershipDashboard 
      showDemoSeed={isAdmin} 
      executiveSummary={executiveSummary} 
    />
  ); 
}


function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Executive Summary Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>

      Three Column Grid Skeleton
      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>

      {/* Unanswered Questions Skeleton */}
      <Skeleton className="h-64" />

      {/* Analytics Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>

      {/* Platform Highlights Skeleton */}
      <Skeleton className="h-48" />
    </div>
  );
}
