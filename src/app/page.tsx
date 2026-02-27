"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { LiveDashboard } from "@/components/live-dashboard";
import { ScheduleView } from "@/components/schedule-view";
import { EmployeeManager } from "@/components/employee-manager";
import { AbsenceManager } from "@/components/absence-manager";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden px-4 py-3 2xl:px-6">
        {activeTab === "dashboard" && <LiveDashboard />}
        {activeTab === "schedule" && <ScheduleView />}
        {activeTab === "employees" && <EmployeeManager />}
        {activeTab === "absences" && <AbsenceManager />}
      </main>
    </div>
  );
};

export default Home;
