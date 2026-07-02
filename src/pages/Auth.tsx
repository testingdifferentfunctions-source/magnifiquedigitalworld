import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authSchema, emailSchema, passwordSchema } from '@/lib/validation';
import logo from '@/assets/logo.jpg';

const Auth = () => {
  const [isSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const { signIn, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

    if (isSignUp) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0]?.message;
      }
    } else {
      if (password.length < 6) {
        newErrors.password = t('auth.enter_password');
      }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        count: newCount,
        blockedUntil: Date.now() + BLOCK_DURATION_MS,
      }));
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
      const { error } = await signIn(email.trim(), password);
      if (error) {
        const attempts = recordFailedAttempt();
        if (attempts >= MAX_ATTEMPTS) setBlocked(true);
        const left = MAX_ATTEMPTS - attempts;
        if (left <= 0) {
          toast.error(t('auth.too_many_attempts'));
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error(`${t('auth.invalid_credentials')} (${t('auth.attempts_left').replace('{n}', String(left))})`);
        } else {
          toast.error(t('auth.error'));
        }
      } else {
        clearAttempts();
        toast.success(t('auth.success'));
        navigate('/');
      }
    } catch {
      toast.error(t('auth.general_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Magnifique numérique" className="w-16 h-16 rounded-lg" />
          </div>
          <CardTitle className="text-2xl">{t('auth.title')}</CardTitle>
          <CardDescription>
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
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
            <Button type="submit" className="w-full" disabled={loading || blocked}>
              {blocked ? t('auth.too_many_attempts') : loading ? t('auth.loading') : t('auth.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
