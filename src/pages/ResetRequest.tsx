import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { emailSchema } from '@/lib/validation';
import { ArrowLeft, MailCheck } from 'lucide-react';
import logo from '@/assets/logo.jpg';

const LOGIN_PATH = '/oRXbyat6a9YPTWyyeR5zp5CUAi68Hwvs';

const ResetRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const state = location.state as { resetToken?: string } | null;
  const authorized = !!state?.resetToken && !!token && state.resetToken === token;

  useEffect(() => {
    if (!authorized) {
      navigate(LOGIN_PATH, { replace: true });
    }
  }, [authorized, navigate]);

  if (!authorized) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        toast.error(t('reset.error'));
      } else {
        setSent(true);
        toast.success(t('reset.sent'));
      }
    } catch {
      toast.error(t('reset.error'));
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
          <CardTitle className="text-2xl">{t('reset.title')}</CardTitle>
          <CardDescription>{t('reset.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MailCheck className="h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">{t('reset.sent')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(undefined);
                  }}
                  placeholder="your@email.com"
                  required
                  maxLength={255}
                  autoComplete="email"
                  className={`bg-background border-border ${error ? 'border-destructive' : ''}`}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.loading') : t('reset.submit')}
              </Button>
            </form>
          )}
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate(LOGIN_PATH, { replace: true })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('auth.back_to_login')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetRequest;
