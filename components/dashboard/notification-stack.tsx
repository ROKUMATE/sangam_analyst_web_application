"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: "critical" | "verified"
}

interface NotificationStackProps {
  notifications: Notification[]
}

export default function NotificationStack({ notifications }: NotificationStackProps) {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`pointer-events-auto animate-in slide-in-from-top-2 fade-in p-4 rounded-lg shadow-lg border flex items-center gap-3 max-w-sm ${
            notification.type === "critical"
              ? "bg-destructive/10 border-destructive/50 text-destructive"
              : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
          }`}
        >
          {notification.type === "critical" ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      ))}
    </div>
  )
}
