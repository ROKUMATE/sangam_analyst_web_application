"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Waves, CheckCircle, Loader2 } from "lucide-react"

interface LoginPageProps {
  onLoginSuccess: (analyst: { name: string; phone: string }) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)
    setError("")

    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true)
      setStep("otp")
      setLoading(false)
    }, 1000)
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP")
      return
    }

    setLoading(true)
    setError("")

    // Simulate OTP verification
    setTimeout(() => {
      if (otp === "1234" || otp.length === 4) {
        const analystNames = ["Dr. Sarah Kumar", "James Chen", "Maria Garcia", "Ahmed Hassan"]
        const randomName = analystNames[Math.floor(Math.random() * analystNames.length)]

        onLoginSuccess({
          name: randomName,
          phone: phone,
        })
      } else {
        setError("Invalid OTP. Please try again.")
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">AquaX</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">Analyst Portal</CardDescription>
            </div>
          </div>
          <p className="text-sm font-medium">Ocean Disaster Management</p>
        </CardHeader>

        <CardContent className="pt-8 px-6 pb-6">
          {step === "phone" ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Mobile Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="text-base h-12 border-border bg-input text-foreground placeholder:text-hint"
                />
                <p className="text-xs text-hint mt-1.5">We'll send you a verification code</p>
              </div>

              {error && (
                <Alert className="border-destructive/50 bg-destructive/10 rounded-lg">
                  <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold py-6 rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="font-semibold text-foreground">{phone}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-foreground mb-2">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono h-12 border-border bg-input text-foreground"
                />
                <p className="text-xs text-hint mt-1.5">Check your SMS for the code</p>
              </div>

              {error && (
                <Alert className="border-destructive/50 bg-destructive/10 rounded-lg">
                  <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold py-6 rounded-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("phone")
                    setOtp("")
                    setPhone("")
                    setOtpSent(false)
                  }}
                  disabled={loading}
                  className="w-full border-border text-foreground hover:bg-muted rounded-lg"
                >
                  Change Number
                </Button>
              </div>

              {!otpSent && (
                <Button
                  variant="ghost"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full text-sm text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                >
                  Resend OTP
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
