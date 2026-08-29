import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  KeyRound,
  QrCode,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

interface TotpFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

interface EnrollmentData {
  id: string;
  type: 'totp';
  totp: {
    qr_code?: string;
    secret: string;
    uri: string;
  };
}

export const TwoFactorAuthSettings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchFactors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error('Error listing MFA factors:', error);
      } else {
        const verifiedOrAll = (data?.totp || data?.all || []) as TotpFactor[];
        setFactors(verifiedOrAll);
      }
    } catch (err) {
      console.error('Failed to load 2FA factors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFactors();
    }
  }, [user]);

  const activeTotpFactor = factors.find(
    (f) => f.factor_type === 'totp' && f.status === 'verified'
  );

  const handleStartEnrollment = async () => {
    setEnrollment(null);
    setVerifyCode('');
    setLoading(true);

    try {
      // First clean up unverified factors if any
      const unverified = factors.filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified'
      );
      for (const uf of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: uf.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Magnifique Numérique',
        friendlyName: user?.email || 'Admin',
      });

      if (error || !data) {
        toast.error(error?.message || t('mfa.error_enabling'));
        return;
      }

      setEnrollment(data as unknown as EnrollmentData);
    } catch (err: any) {
      toast.error(err?.message || t('mfa.error_enabling'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnrollment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enrollment || verifyCode.length !== 6) return;

    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: enrollment.id });

      if (challengeError) {
        toast.error(challengeError.message || t('mfa.error_enabling'));
        setVerifying(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollment.id,
        challengeId: challengeData.id,
        code: verifyCode.trim(),
      });

      if (verifyError) {
        toast.error(t('mfa.error_enabling'));
        setVerifying(false);
        return;
      }

      toast.success(t('mfa.success_enabled'));
      setEnrollment(null);
      setVerifyCode('');
      await fetchFactors();
    } catch (err: any) {
      toast.error(err?.message || t('mfa.error_enabling'));
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!activeTotpFactor) return;

    setDisabling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: activeTotpFactor.id,
      });

      if (error) {
        toast.error(error.message || t('mfa.error_disabling'));
      } else {
        toast.success(t('mfa.success_disabled'));
        setEnrollment(null);
        await fetchFactors();
      }
    } catch (err: any) {
      toast.error(err?.message || t('mfa.error_disabling'));
    } finally {
      setDisabling(false);
    }
  };

  const handleCopySecret = () => {
    if (!enrollment?.totp.secret) return;
    navigator.clipboard.writeText(enrollment.totp.secret);
    setCopied(true);
    toast.success(t('mfa.copied'));
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-bold">{t('mfa.title')}</CardTitle>
          </div>
          <CardDescription>{t('mfa.subtitle')}</CardDescription>
        </div>
        <div>
          {loading ? (
            <Badge variant="outline" className="animate-pulse">
              ...
            </Badge>
          ) : activeTotpFactor ? (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 gap-1.5 px-3 py-1">
              <ShieldCheck className="w-4 h-4" />
              {t('mfa.status_enabled')}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-muted-foreground border-border">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {t('mfa.status_disabled')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Status description */}
        <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-background border border-border shrink-0 mt-0.5">
            {activeTotpFactor ? (
              <Smartphone className="w-5 h-5 text-green-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {activeTotpFactor
                ? t('mfa.status_enabled_desc')
                : t('mfa.status_disabled_desc')}
            </p>
            {activeTotpFactor && (
              <p className="text-xs text-muted-foreground font-mono">
                Factor ID: {activeTotpFactor.id} • TOTP (Google Authenticator)
              </p>
            )}
          </div>
        </div>

        {/* Action button if not enrolling */}
        {!enrollment && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {!activeTotpFactor ? (
              <Button
                onClick={handleStartEnrollment}
                disabled={loading}
                className="gap-2 font-semibold"
              >
                <QrCode className="w-4 h-4" />
                {t('mfa.setup_btn')}
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={disabling}
                    className="gap-2 font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    {disabling ? t('mfa.disabling') : t('mfa.disable_btn')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('mfa.confirm_disable_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('mfa.confirm_disable_desc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('mfa.cancel_btn')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisable2FA}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('mfa.disable_btn')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={fetchFactors}
              disabled={loading}
              title="Оновити статус"
              className="ml-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}

        {/* Enrollment Step-by-Step UI */}
        {enrollment && (
          <div className="border border-primary/30 bg-primary/5 rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  Налаштування Google Authenticator
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEnrollment(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                {t('mfa.cancel_btn')}
              </Button>
            </div>

            {/* Step 1: Scan QR */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {t('mfa.step1_title')}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('mfa.step1_desc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* QR Code Container */}
                <div className="bg-white p-4 rounded-xl shadow-md border border-border inline-flex items-center justify-center shrink-0">
                  <QRCodeSVG
                    value={enrollment.totp.uri}
                    size={180}
                    level="M"
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>

                {/* Secret Key manual entry */}
                <div className="space-y-2 flex-1 w-full text-left">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t('mfa.manual_key')}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-background px-3 py-2 rounded-lg border border-border font-mono text-xs sm:text-sm tracking-wider text-foreground break-all flex-1 select-all">
                      {enrollment.totp.secret}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                      className="gap-1.5 shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {copied ? t('mfa.copied') : t('mfa.copy_key')}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Застосунок: Google Authenticator, Authy, або 1Password
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Verification Input */}
            <form onSubmit={handleVerifyEnrollment} className="space-y-4 pt-2 border-t border-border/60">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  {t('mfa.step2_title')}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('mfa.step2_desc')}
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-start gap-4 pt-1">
                <InputOTP
                  maxLength={6}
                  value={verifyCode}
                  onChange={setVerifyCode}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-11 h-12 text-lg font-bold" />
                    <InputOTPSlot index={1} className="w-11 h-12 text-lg font-bold" />
                    <InputOTPSlot index={2} className="w-11 h-12 text-lg font-bold" />
                    <InputOTPSlot index={3} className="w-11 h-12 text-lg font-bold" />
                    <InputOTPSlot index={4} className="w-11 h-12 text-lg font-bold" />
                    <InputOTPSlot index={5} className="w-11 h-12 text-lg font-bold" />
                  </InputOTPGroup>
                </InputOTP>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    type="submit"
                    disabled={verifying || verifyCode.length !== 6}
                    className="gap-2 font-semibold w-full sm:w-auto"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {verifying ? t('mfa.activating') : t('mfa.activate_btn')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEnrollment(null)}
                    disabled={verifying}
                  >
                    {t('mfa.cancel_btn')}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuthSettings;
