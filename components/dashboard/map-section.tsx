"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tweet } from "./dashboard-page"

interface MapSectionProps {
  tweets: Tweet[]
  selectedTweetId?: string
  onSelectTweet?: (tweet: Tweet) => void
}

export default function MapSection({ tweets, selectedTweetId, onSelectTweet }: MapSectionProps) {
  const minLat = Math.min(...tweets.map((t) => t.latitude)) - 0.05
  const maxLat = Math.max(...tweets.map((t) => t.latitude)) + 0.05
  const minLon = Math.min(...tweets.map((t) => t.longitude)) - 0.05
  const maxLon = Math.max(...tweets.map((t) => t.longitude)) + 0.05

  const getLat = (lat: number) => {
    return ((maxLat - lat) / (maxLat - minLat)) * 100
  }

  const getLon = (lon: number) => {
    return ((lon - minLon) / (maxLon - minLon)) * 100
  }

  return (
    <Card className="border-2 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg">Incident Hotspots Map</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="relative w-full flex-1 bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
          {tweets.map((tweet) => {
            const isSelected = tweet.id === selectedTweetId
            let color = "bg-yellow-500"
            if (tweet.severity === "critical") color = "bg-red-500"
            else if (tweet.severity === "high") color = "bg-orange-500"
            else if (tweet.severity === "medium") color = "bg-yellow-500"

            return (
              <button
                key={tweet.id}
                onClick={() => onSelectTweet?.(tweet)}
                className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 ${color} ${
                  isSelected ? "scale-150 ring-2 ring-offset-2 ring-primary" : "hover:scale-125"
                }`}
                style={{
                  left: `${getLon(tweet.longitude)}%`,
                  top: `${getLat(tweet.latitude)}%`,
                }}
                title={`${tweet.author}: ${tweet.severity}`}
              />
            )
          })}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
