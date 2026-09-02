import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { emailSchema } from '@/lib/validation';
import { ShieldCheck, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.svg';
import { getAdminRoute } from '@/lib/adminPath';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.97-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const Auth = () => {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 2FA Challenge state
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mfaVerifying, setMfaVerifying] = useState(false);

  const { signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Clear legacy auth attempt lockout from localStorage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('auth-attempts');
    } catch {
      /* ignore */
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = error.message || t('auth.error');
        setServerError(msg);
        toast.error(msg);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      const msg = err?.message || t('auth.general_error');
      setServerError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const resetToken =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    navigate(`/reset-request/${resetToken}`, { state: { resetToken } });
  };

  useEffect(() => {
    if (user && step !== '2fa') {
      supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
        if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
          // User requires 2FA, do not auto-redirect
          return;
        }
        navigate(getAdminRoute());
      });
    }
  }, [user, step, navigate]);

  const validateFields = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0]?.message;
    }

    if (!password || password.length === 0) {
      newErrors.password = t('auth.enter_password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Output raw Supabase error message directly to the UI without blocking
        const rawMessage = error.message || t('auth.error');
        setServerError(rawMessage);
        toast.error(rawMessage);
        setLoading(false);
        return;
      }

      // Check Multi-Factor status (2FA TOTP check)
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (!aalError && aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
        // 2FA is enrolled for this user! Proceed to Challenge step
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        const totpFactor =
          factors?.totp?.find((f) => f.status === 'verified') ||
          factors?.all?.find((f: any) => f.factor_type === 'totp' && f.status === 'verified');

        if (totpFactor && !factorsError) {
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: totpFactor.id,
          });

          if (!challengeError && challengeData) {
            setMfaFactorId(totpFactor.id);
            setMfaChallengeId(challengeData.id);
            setOtpCode('');
            setStep('2fa');
            setLoading(false);
            return;
          }
        }
      }

      // If no 2FA required, proceed to application
      toast.success(t('auth.success'));
      navigate(getAdminRoute());
    } catch (err: any) {
      const rawErrorMsg = err?.message || t('auth.general_error');
      setServerError(rawErrorMsg);
      toast.error(rawErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6 || !mfaFactorId || !mfaChallengeId) return;

    setMfaVerifying(true);
    setServerError(null);
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: otpCode.trim(),
      });

      if (verifyError) {
        const msg = verifyError.message || t('auth.mfa_invalid');
        setServerError(msg);
        toast.error(msg);
        setOtpCode('');
        setMfaVerifying(false);
        return;
      }

      toast.success(t('auth.success'));
      navigate(getAdminRoute());
    } catch (err: any) {
      const msg = err?.message || t('auth.mfa_invalid');
      setServerError(msg);
      toast.error(msg);
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    setStep('credentials');
    setOtpCode('');
    setMfaFactorId('');
    setMfaChallengeId('');
    setPassword('');
    setServerError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md bg-card border-border shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Magnifique numérique"
              className="w-16 h-16 rounded-full object-cover shadow-md"
            />
          </div>

          {step === 'credentials' ? (
            <>
              <CardTitle className="text-2xl font-bold">{t('auth.title')}</CardTitle>
              <CardDescription>{t('auth.subtitle')}</CardDescription>
            </>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Google Authenticator</span>
              </div>
              <CardTitle className="text-2xl font-bold">{t('auth.mfa_title')}</CardTitle>
              <CardDescription>{t('auth.mfa_subtitle')}</CardDescription>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {serverError && (
            <div className="mb-4 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="break-words font-medium">{serverError}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                      if (serverError) setServerError(null);
                    }}
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                    autoComplete="email"
                    className={`bg-background border-border ${errors.email ? 'border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                      if (serverError) setServerError(null);
                    }}
                    placeholder="••••••••"
                    required
                    maxLength={72}
                    autoComplete="current-password"
                    className={`bg-background border-border ${errors.password ? 'border-destructive' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? t('auth.loading') : t('auth.submit')}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-muted-foreground hover:text-primary"
                  onClick={handleForgotPassword}
                >
                  {t('auth.forgot')}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? t('auth.loading') : t('auth.google')}
              </Button>
            </>
          ) : (
            /* STEP 2: 2FA Verification Form */
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-2">
                <Label htmlFor="otp-input" className="text-sm font-medium text-muted-foreground text-center">
                  {t('auth.mfa_code_label')}
                </Label>

                <div className="flex justify-center w-full">
                  <InputOTP
                    id="otp-input"
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      if (serverError) setServerError(null);
                      if (val.length === 6) {
                        // Auto trigger verify when 6 digits are typed
                        setTimeout(() => {
                          const form = document.getElementById('2fa-form-submit-btn');
                          form?.click();
                        }, 50);
                      }
                    }}
                    autoFocus
                  >
                    <InputOTPGroup className="gap-2 sm:gap-2.5">
                      <InputOTPSlot index={0} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                      <InputOTPSlot index={1} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                      <InputOTPSlot index={2} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                      <InputOTPSlot index={3} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                      <InputOTPSlot index={4} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                      <InputOTPSlot index={5} className="w-10 h-12 sm:w-11 sm:h-12 text-lg font-bold" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  id="2fa-form-submit-btn"
                  type="submit"
                  className="w-full font-semibold gap-2"
                  disabled={mfaVerifying || otpCode.length !== 6}
                >
                  <Lock className="w-4 h-4" />
                  {mfaVerifying ? t('auth.mfa_verifying') : t('auth.mfa_verify')}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                  onClick={handleBackToLogin}
                  disabled={mfaVerifying}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.mfa_back')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

