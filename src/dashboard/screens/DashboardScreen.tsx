"use client";

import { AIStatusPanel } from "@/dashboard/molecules/AIStatusPanel";
import { QuickActions } from "@/dashboard/molecules/QuickActions";
import { EmployeeWelcome } from "@/dashboard/atoms/EmployeeWelcome";
import { ManagerWelcome } from "@/dashboard/atoms/ManagerWelcome";
import { LeadershipDashboard } from "@/dashboard/organisms/LeaderShipBoard";
import { getRolePermissions } from "@/auth/hooks/getRolePermissions";
import type { DashboardInitialUser } from "@/auth/types/DashboardInitializedUser";

export function DashboardScreen({
  initialUser,
}: {
  initialUser: DashboardInitialUser | null;
}) {

  const {
    isAdmin,
    isManager,
    isLeadership,
  } = getRolePermissions(initialUser?.role);

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