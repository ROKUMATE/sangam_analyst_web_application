'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Clock, Bell, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface DashboardHeaderProps {
  analyst: { name: string; phone: string } | null;
  onLogout: () => void;
}

export default function DashboardHeader({
  analyst,
  onLogout,
}: DashboardHeaderProps) {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <header className="bg-card dark:bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
            <img
              src="/sangam_logo.png"
              alt="Sangam Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sangam</h1>
            <p className="text-xs text-muted-foreground">Analyst Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"> */}
          {/* <Clock className="w-4 h-4" /> */}
          {/* <span>{currentTime}</span> */}
          {/* </div> */}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-muted">
              <BarChart3 className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline text-sm">Analytics</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {analyst && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {analyst.name}
                </p>
                {/* <p className="text-xs text-muted-foreground">{analyst.phone}</p> */}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center gap-3 border-border text-foreground hover:bg-muted bg-transparent">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
