'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/auth/login-page';
import DashboardPage from '@/components/dashboard/dashboard-page';
import { isAuthenticated, getUserData } from '@/lib/utils/cookies';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [analyst, setAnalyst] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserData();
        if (userData) {
          setAnalyst({
            name: userData.name,
            phone: userData.phone,
          });
          setIsLoggedIn(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (analystData: { name: string; phone: string }) => {
    setAnalyst(analystData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAnalyst(null);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardPage analyst={analyst} onLogout={handleLogout} />
      )}
    </main>
  );
}
