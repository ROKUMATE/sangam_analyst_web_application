"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, MapPin, CheckCircle2, XCircle, Flag } from "lucide-react"
import type { Tweet } from "./dashboard-page"

interface TweetListProps {
  tweets: Tweet[]
  onSelectTweet: (tweet: Tweet) => void
  selectedTweetId?: string
  verificationStatuses: Map<string, "unverified" | "verified_true" | "verified_false">
  sentToAdmin: Set<string>
}

const severityConfig = {
  critical: { color: "destructive", label: "Critical" },
  high: { color: "secondary", label: "High" },
  medium: { color: "accent", label: "Medium" },
  low: { color: "muted", label: "Low" },
}

export default function TweetList({
  tweets,
  onSelectTweet,
  selectedTweetId,
  verificationStatuses,
  sentToAdmin,
}: TweetListProps) {
  return (
    <div className="space-y-2">
      {tweets.map((tweet) => {
        const status = verificationStatuses.get(tweet.id) || "unverified"
        let borderColor = "border-border"
        let bgColor = ""
        if (status === "verified_true") {
          borderColor = "border-green-500"
          bgColor = "bg-green-50 dark:bg-green-950/30"
        } else if (status === "verified_false") {
          borderColor = "border-red-500"
          bgColor = "bg-red-50 dark:bg-red-950/30"
        } else if (selectedTweetId === tweet.id) {
          borderColor = "border-primary"
          bgColor = "bg-primary/5"
        }

        return (
          <Card
            key={tweet.id}
            data-tweet-id={tweet.id}
            onClick={() => onSelectTweet(tweet)}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${borderColor} ${bgColor} p-3`}
          >
            <div className="flex flex-col gap-2">
              {/* Header: Avatar and Author Info */}
              <div className="flex items-start gap-2">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarImage src={tweet.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{tweet.author[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs leading-tight">{tweet.author}</p>
                  <p className="text-xs text-muted-foreground">{tweet.timestamp}</p>
                </div>

                <Badge
                  variant="outline"
                  className={`text-xs flex-shrink-0 ${
                    severityConfig[tweet.severity].color === "destructive"
                      ? "border-destructive/50 bg-destructive/10 text-destructive"
                      : severityConfig[tweet.severity].color === "secondary"
                        ? "border-secondary/50 bg-secondary/10 text-secondary"
                        : "border-accent/50 bg-accent/10 text-accent"
                  }`}
                >
                  {severityConfig[tweet.severity].label}
                </Badge>
              </div>

              {tweet.image && (
                <div className="rounded overflow-hidden border border-border bg-muted h-20 w-full">
                  <img
                    src={tweet.image || "/placeholder.svg"}
                    alt="Tweet preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <p className="text-xs text-foreground line-clamp-2 leading-snug">{tweet.content}</p>

              {/* Footer: Stats and Status */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{tweet.votes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{tweet.distance} km</span>
                </div>

                <div className="flex gap-1 ml-auto">
                  {status === "verified_true" && (
                    <Badge className="bg-green-600 text-white text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      True
                    </Badge>
                  )}
                  {status === "verified_false" && (
                    <Badge className="bg-red-600 text-white text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      False
                    </Badge>
                  )}
                  {status === "unverified" && (
                    <Badge variant="outline" className="text-xs">
                      <Flag className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
