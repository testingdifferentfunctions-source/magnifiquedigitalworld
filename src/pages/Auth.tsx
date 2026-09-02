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
import { emailSchema, passwordSchema } from '@/lib/validation';
import { ShieldCheck, ArrowLeft, KeyRound, Lock } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // 2FA Challenge state
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mfaVerifying, setMfaVerifying] = useState(false);

  const { signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || t('auth.error'));
        setGoogleLoading(false);
      }
    } catch {
      toast.error(t('auth.general_error'));
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

  useEffect(() => {
    const check = () => setBlocked(isBlocked());
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFields = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0]?.message;
    }

    if (password.length < 6) {
      newErrors.password = t('auth.enter_password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const MAX_ATTEMPTS = 4;
  const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'auth-attempts';

  const getAttemptsState = (): { count: number; blockedUntil: number | null } => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { count: 0, blockedUntil: null };
      const parsed = JSON.parse(raw);
      return { count: parsed.count ?? 0, blockedUntil: parsed.blockedUntil ?? null };
    } catch {
      return { count: 0, blockedUntil: null };
    }
  };

  const isBlocked = (): boolean => {
    const { blockedUntil } = getAttemptsState();
    if (blockedUntil && blockedUntil > Date.now()) return true;
    if (blockedUntil && blockedUntil <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return false;
  };

  const recordFailedAttempt = () => {
    const { count } = getAttemptsState();
    const newCount = count + 1;
    if (newCount >= MAX_ATTEMPTS) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          count: newCount,
          blockedUntil: Date.now() + BLOCK_DURATION_MS,
        })
      );
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: newCount, blockedUntil: null }));
    }
    return newCount;
  };

  const clearAttempts = () => localStorage.removeItem(STORAGE_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked()) {
      toast.error(t('auth.too_many_attempts'));
      return;
    }

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
        const attempts = recordFailedAttempt();
        if (attempts >= MAX_ATTEMPTS) setBlocked(true);
        const left = MAX_ATTEMPTS - attempts;
        if (left <= 0) {
          toast.error(t('auth.too_many_attempts'));
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error(
            `${t('auth.invalid_credentials')} (${t('auth.attempts_left').replace('{n}', String(left))})`
          );
        } else {
          toast.error(t('auth.error'));
        }
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
      clearAttempts();
      toast.success(t('auth.success'));
      navigate(getAdminRoute());
    } catch {
      toast.error(t('auth.general_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6 || !mfaFactorId || !mfaChallengeId) return;

    setMfaVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: otpCode.trim(),
      });

      if (verifyError) {
        toast.error(t('auth.mfa_invalid'));
        setOtpCode('');
        setMfaVerifying(false);
        return;
      }

      clearAttempts();
      toast.success(t('auth.success'));
      navigate(getAdminRoute());
    } catch {
      toast.error(t('auth.mfa_invalid'));
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
                <Button type="submit" className="w-full font-semibold" disabled={loading || blocked}>
                  {blocked
                    ? t('auth.too_many_attempts')
                    : loading
                    ? t('auth.loading')
                    : t('auth.submit')}
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

