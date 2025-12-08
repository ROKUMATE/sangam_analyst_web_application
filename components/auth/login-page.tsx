'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Waves,
  CheckCircle,
  Loader2,
  Lock,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (analyst: { name: string; phone: string }) => void;
}

/**
 * TOKEN MANAGEMENT FLOW (To be implemented with API integration):
 *
 * 1. On successful OTP verification:
 *    - API returns accessToken and refreshToken
 *    - Store both tokens in httpOnly cookies (for security)
 *    - accessToken: short-lived (15-30 mins)
 *    - refreshToken: long-lived (7-30 days)
 *
 * 2. On subsequent API calls:
 *    - Include accessToken as Bearer token in Authorization header
 *    - If accessToken expires (401 response), use refreshToken to get new accessToken
 *    - Cookies are automatically sent with requests (httpOnly flag)
 *
 * 3. Automatic redirect logic:
 *    - If valid accessToken exists in cookies → Skip login, go to dashboard
 *    - If accessToken expired but refreshToken valid → Refresh token silently
 *    - If refreshToken invalid/expired → Redirect to login
 *
 * 4. Logout:
 *    - Clear both tokens from cookies
 *    - Redirect to login page
 */

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone })
      // })
      // const data = await response.json()
      // if (!data.success) throw new Error(data.message)

      // Simulate OTP sending
      setTimeout(() => {
        setOtpSent(true);
        setStep('otp');
        setResendTimer(60);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send OTP. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call and token storage
      // const response = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone, otp })
      // })
      // const data = await response.json()
      //
      // if (data.success) {
      //   // Store tokens in httpOnly cookies (automatically done by server)
      //   // accessToken: for API requests (short-lived)
      //   // refreshToken: for getting new accessToken (long-lived)
      //   onLoginSuccess({
      //     name: data.analyst.name,
      //     phone: data.analyst.phone
      //   })
      // } else {
      //   throw new Error(data.message)
      // }

      // Simulate OTP verification
      setTimeout(() => {
        if (otp === '1234' || otp.length === 4) {
          const analystNames = [
            'Dr. Sarah Kumar',
            'James Chen',
            'Maria Garcia',
            'Ahmed Hassan',
          ];
          const randomName =
            analystNames[Math.floor(Math.random() * analystNames.length)];

          // Mock token storage (replace with actual cookie storage after API integration)
          // document.cookie = `accessToken=${mockToken}; httpOnly; secure; sameSite=strict;`
          // document.cookie = `refreshToken=${mockRefreshToken}; httpOnly; secure; sameSite=strict;`

          onLoginSuccess({
            name: randomName,
            phone: phone,
          });
        } else {
          setError('Invalid OTP. Please try again.');
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setResendTimer(60);
    handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 dark:from-blue-950 dark:via-background dark:to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl shadow-lg">
              <Waves className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sangam</h1>
          <p className="text-sm text-muted-foreground">
            Ocean Disaster Management Platform
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-blue-200 dark:border-blue-800 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 dark:from-primary/10 dark:via-secondary/10 dark:to-primary/10 border-b border-blue-200 dark:border-blue-800 px-6 py-8">
            <CardTitle className="text-xl text-foreground">
              {step === 'phone' ? 'Analyst Login' : 'Verify OTP'}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === 'phone'
                ? 'Enter your mobile number to receive a verification code'
                : 'Enter the 6-digit code sent to your phone'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-8">
            {step === 'phone' ? (
              <div className="space-y-6">
                {/* Phone Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-foreground">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError('');
                      }}
                      disabled={loading}
                      className="text-base h-12 border-2 border-blue-200 dark:border-blue-800 bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Secure authentication via OTP
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert className="border-2 border-destructive/50 bg-destructive/5 rounded-lg">
                    <AlertDescription className="text-destructive text-sm font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Send OTP Button */}
                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !phone}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground text-base font-semibold h-12 rounded-lg transition-all shadow-md hover:shadow-lg">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You'll receive a 6-digit verification code via SMS. This
                    helps us keep your account secure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Verification code sent
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    to {phone}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-foreground">
                    Enter OTP Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);
                      setOtp(value);
                      setError('');
                    }}
                    disabled={loading}
                    maxLength={6}
                    className="text-center text-3xl tracking-widest font-mono h-14 border-2 border-blue-200 dark:border-blue-800 bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    OTP expires in 5 minutes
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert className="border-2 border-destructive/50 bg-destructive/5 rounded-lg">
                    <AlertDescription className="text-destructive text-sm font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 4}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground text-base font-semibold h-12 rounded-lg transition-all shadow-md hover:shadow-lg">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>

                {/* Change Number Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setPhone('');
                    setOtpSent(false);
                    setError('');
                    setResendTimer(0);
                  }}
                  disabled={loading}
                  className="w-full border-2 border-blue-200 dark:border-blue-800 text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 h-12 rounded-lg transition-all font-medium">
                  Change Phone Number
                </Button>

                {/* Resend OTP Button */}
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={loading || resendTimer > 0}
                    className="text-sm text-primary hover:text-primary hover:bg-primary/10 font-medium">
                    {resendTimer > 0 ? (
                      <>
                        Resend in{' '}
                        <span className="ml-1 font-bold">{resendTimer}s</span>
                      </>
                    ) : (
                      "Didn't receive the code? Resend"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <p>For security purposes, all communications are encrypted</p>
          <p className="text-xs">
            © 2025 Sangam Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
