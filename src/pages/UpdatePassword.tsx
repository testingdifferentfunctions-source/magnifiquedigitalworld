import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { passwordSchema } from '@/lib/validation';
import logo from '@/assets/logo.jpg';

const LOGIN_PATH = '/oRXbyat6a9YPTWyyeR5zp5CUAi68Hwvs';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash;
      if (session || hash.includes('type=recovery')) {
        setReady(true);
      } else {
        toast.error(t('update.invalid_link'));
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirm?: string } = {};

    const result = passwordSchema.safeParse(password);
    if (!result.success) newErrors.password = result.error.errors[0]?.message;
    if (password !== confirm) newErrors.confirm = t('update.mismatch');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || t('update.error'));
      } else {
        toast.success(t('update.success'));
        await supabase.auth.signOut();
        navigate(LOGIN_PATH, { replace: true });
      }
    } catch {
      toast.error(t('update.error'));
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
          <CardTitle className="text-2xl">{t('update.title')}</CardTitle>
          <CardDescription>{t('update.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('update.new_password')}</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                required
                maxLength={72}
                autoComplete="new-password"
                className={`bg-background border-border ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('update.confirm_password')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm) setErrors({ ...errors, confirm: undefined });
                }}
                placeholder="••••••••"
                required
                maxLength={72}
                autoComplete="new-password"
                className={`bg-background border-border ${errors.confirm ? 'border-destructive' : ''}`}
              />
              {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? t('auth.loading') : t('update.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePassword;
