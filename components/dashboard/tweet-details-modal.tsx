"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, ThumbsUp, X, CheckCircle2, Send, Zap, Settings, Loader2 } from "lucide-react"
import type { Tweet } from "./dashboard-page"

interface TweetDetailsModalProps {
  tweet: Tweet
  isVerified: boolean
  isSentToAdmin: boolean
  verificationMethod: "ai" | "manual" | null
  onVerify: (method: "ai" | "manual") => void
  onSendToAdmin: () => void
  onClose: () => void
}

export default function TweetDetailsModal({
  tweet,
  isVerified,
  isSentToAdmin,
  verificationMethod,
  onVerify,
  onSendToAdmin,
  onClose,
}: TweetDetailsModalProps) {
  const severityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-secondary text-secondary-foreground",
    medium: "bg-accent text-accent-foreground",
    low: "bg-primary text-primary-foreground",
  }

  return (
    <Card className="h-full flex flex-col border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">Tweet Details</CardTitle>
              <Badge className={severityColors[tweet.severity]}>
                {tweet.severity.charAt(0).toUpperCase() + tweet.severity.slice(1)}
              </Badge>
            </div>
            <CardDescription>Tweet ID: {tweet.id}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Author Info */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <Avatar>
            <AvatarImage src={tweet.avatar || "/placeholder.svg"} />
            <AvatarFallback>{tweet.author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-sm">{tweet.author}</p>
            <p className="text-xs text-muted-foreground">{tweet.timestamp}</p>
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm text-foreground leading-relaxed mb-3">{tweet.content}</p>
          {tweet.image && (
            <img
              src={tweet.image || "/placeholder.svg"}
              alt="Tweet content"
              className="w-full rounded-lg border border-border object-cover max-h-40"
            />
          )}
        </div>

        {/* Location & Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{tweet.distance} km away</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{tweet.timestamp}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <ThumbsUp className="w-4 h-4" />
            <span>{tweet.votes} upvotes</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-muted/50 rounded p-2 text-xs font-mono text-muted-foreground">
          <p>Lat: {tweet.latitude.toFixed(4)}</p>
          <p>Lon: {tweet.longitude.toFixed(4)}</p>
        </div>

        {/* Status */}
        {(isVerified || isSentToAdmin) && (
          <div className="space-y-2">
            {isVerified && (
              <Alert className="border-accent/50 bg-accent/10">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <AlertDescription className="text-accent text-xs">
                  Verified by you using {verificationMethod === "ai" ? "AI Analytics" : "Manual Review"}
                </AlertDescription>
              </Alert>
            )}
            {isSentToAdmin && (
              <Alert className="border-secondary/50 bg-secondary/10">
                <Send className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-secondary text-xs">
                  Sent to administrator for further action
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Verification Section */}
        {!isVerified ? (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-semibold">Verify This Tweet</h4>
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ai" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Analytics
                </TabsTrigger>
                <TabsTrigger value="manual" className="text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground">
                  Use AI-powered social media analytics to verify credibility
                </p>
                <Button
                  onClick={() => onVerify("ai")}
                  disabled={verificationMethod !== null}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-sm"
                >
                  {verificationMethod === "ai" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Verify with AI
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground">Manually review and verify the information</p>
                <Button
                  onClick={() => onVerify("manual")}
                  disabled={verificationMethod !== null}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-sm"
                >
                  {verificationMethod === "manual" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Verify Manually
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="pt-3 border-t">
            <Button
              onClick={onSendToAdmin}
              disabled={isSentToAdmin}
              className="w-full bg-gradient-to-r from-secondary to-accent text-sm"
            >
              {isSentToAdmin ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Sent to Administrator
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Administrator
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
