"use client";

import { AIStatusPanel } from "@/dashboard/molecules/AIStatusPanel";
import { QuickActions } from "@/dashboard/molecules/QuickActions";
import { useRole } from "@/common/hooks/useRole";
import { EmployeeWelcome } from "@/dashboard/atoms/EmployeeWelcome";
import { ManagerWelcome } from "@/dashboard/atoms/ManagerWelcome";
import { LeadershipDashboard } from "@/dashboard/organisms/LeaderShipBoard";

export function DashboardScreen() {
  const { isAdmin, isManager, isLeadership } = useRole();

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
        />
      </div>
    );
  }

  return (
    <LeadershipDashboard 
      showDemoSeed={isAdmin} 
    />
  ); 
}