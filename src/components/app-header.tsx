"use client";

import {
  CalendarClock,
  Users,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Panel en Vivo", icon: LayoutDashboard },
  { id: "schedule", label: "Horarios", icon: CalendarClock },
  { id: "employees", label: "Empleados", icon: Users },
  { id: "absences", label: "Ausencias", icon: AlertTriangle },
];

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 2xl:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <CalendarClock className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-tight 2xl:text-base">
              ShiftFlow
            </h1>
            <p className="text-[10px] text-muted-foreground 2xl:text-xs">
              Gestion Inteligente de Horarios
            </p>
          </div>
        </div>

        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors 2xl:text-sm 2xl:px-4 2xl:py-2",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer",
              )}
            >
              <tab.icon className="h-3.5 w-3.5 2xl:h-4 2xl:w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-muted-foreground 2xl:text-xs">
            En vivo
          </span>
        </div>
      </div>
    </header>
  );
}
