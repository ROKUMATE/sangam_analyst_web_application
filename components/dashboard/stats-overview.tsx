"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Send } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    total: number
    criticalCount: number
    verified: number
    sentToAdmin: number
  }
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="space-y-3">
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Tweets</p>
              <p className="text-2xl font-bold text-destructive">{stats.total}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-destructive/30" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-600">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600/30" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-600">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Verified Reports</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600/30" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-secondary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sent to Admin</p>
              <p className="text-2xl font-bold text-secondary">{stats.sentToAdmin}</p>
            </div>
            <Send className="w-8 h-8 text-secondary/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
