"use client"

import { useState } from "react"
import LoginPage from "@/components/auth/login-page"
import DashboardPage from "@/components/dashboard/dashboard-page"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [analyst, setAnalyst] = useState<{ name: string; phone: string } | null>(null)

  const handleLoginSuccess = (analystData: { name: string; phone: string }) => {
    setAnalyst(analystData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAnalyst(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardPage analyst={analyst} onLogout={handleLogout} />
      )}
    </main>
  )
}
