"use client";

import { AIStatusPanel } from "@/dashboard/molecules/AIStatusPanel";
import { QuickActions } from "@/dashboard/molecules/QuickActions";
import { useRole } from "@/common/hooks/useRole";
import { EmployeeWelcome } from "@/dashboard/atoms/EmployeeWelcome";
import { ManagerWelcome } from "@/dashboard/atoms/ManagerWelcome";
import { LeadershipDashboard } from "@/dashboard/organisms/LeaderShipBoard";
import { useExecutiveSummary } from "@/dashboard/hooks/useExecutiveSummary";

export function DashboardScreen() {
  const { isAdmin, isManager, isLeadership } = useRole();
  const { summary: executiveSummary, error, loading} = useExecutiveSummary();

    if (loading) {
      return <div>Loading dashboard...</div>;
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