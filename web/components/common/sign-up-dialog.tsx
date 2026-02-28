'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authOtpService, authPasswordService } from '@/data/auth-otp';
import { toApiErrorPayload } from '@/data/api-error';
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslations } from 'next-intl';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInClick?: () => void;
}

const signInWithGoogle = async () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_API_URL');
  }

  const returnTo = `${window.location.origin}/api/auth/google/callback`;
  const redirectUrl = `${apiBaseUrl}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  window.location.href = redirectUrl;
};

export function SignUpDialog({ open, onOpenChange, onSignInClick }: SignUpDialogProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastOtpAttempt, setLastOtpAttempt] = useState<string | null>(null)
  const t = useTranslations('auth.signUp')
  const tOtp = useTranslations('auth.otp')

  const otpReady = useMemo(() => otp.replace(/\D/g, '').length === 6, [otp]);

  useEffect(() => {
    if (!open) {
      setStep('credentials');
      setName('');
      setEmail('');
      setPassword('');
      setOtp('');
      setIsSubmitting(false);
      setLastOtpAttempt(null);
    }
  }, [open]);

  useEffect(() => {
    const value = otp.replace(/\D/g, '');
    if (value.length !== 6) setLastOtpAttempt(null);
  }, [otp]);

  async function finalizeLogin(token: string) {
    await authPasswordService.storeToken(token);
    onOpenChange(false);
    router.push('/chat');
  }

  async function handleRegister() {
    if (!name || !email || !password) {
      toast.error(t('errorFields'))
      return
    }

    setIsSubmitting(true);
    try {
      const res = await authPasswordService.register({ name, email, password });

      if (res?.otpRequired) {
        setStep('otp')
        toast.success(tOtp('sent'))
        return
      }

      await authOtpService.request(email)
      setStep('otp')
      toast.success(tOtp('sent'))
    } catch (e) {
      toast.error(toApiErrorPayload(e).error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(code?: string) {
    const value = (code ?? otp).replace(/\D/g, '');
    if (value.length !== 6) {
      toast.error(tOtp('description'))
      return
    }

    if (lastOtpAttempt === value) return;
    setLastOtpAttempt(value);

    setIsSubmitting(true);
    try {
      const { token } = await authOtpService.verify({ email, code: value });
      if (!token) throw new Error('missing_token');
      await finalizeLogin(token);
    } catch (e) {
      toast.error(toApiErrorPayload(e).error);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (step !== 'otp') return;
    if (!otpReady) return;
    if (isSubmitting) return;

    const value = otp.replace(/\D/g, '');
    if (lastOtpAttempt === value) return;

    void handleVerifyOtp();
  }, [otpReady, isSubmitting, step, otp, lastOtpAttempt]);

  const Root = isMobile ? Drawer : Dialog;
  const Content = isMobile ? DrawerContent : DialogContent;
  const Header = isMobile ? DrawerHeader : DialogHeader;
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Content className={isMobile ? 'p-0' : undefined}>
        <Title />
        <Header className="flex flex-col items-center text-center">
          <Image src="/logos/pumkin.svg" alt="Logo" width={32} height={32} className="mb-4" priority quality={100} />
          <Description>
            {step === 'otp' ? tOtp('description') : t('title')}
          </Description>
        </Header>

        {step === 'credentials' ? (
          <div className="space-y-3 p-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('name')}
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <Button variant="secondary" className="w-full" onClick={handleRegister} disabled={isSubmitting}>
              {t('submit')}
            </Button>
            {onSignInClick && (
              <Button
                className="w-full text-muted-foreground"
                variant="link"
                onClick={() => {
                  onOpenChange(false);
                  onSignInClick();
                }}
                disabled={isSubmitting}
              >
                {t('hasAccount')}
              </Button>
            )}
            <Button
              className="w-full bg-white text-black hover:bg-white/95"
              onClick={signInWithGoogle}
              disabled={isSubmitting}
            >
              <span className="flex items-center justify-center gap-2">
                <Image alt="Google" height={14} src="/logos/google.svg" width={14} />
                <span>{t('google')}</span>
              </span>
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-5">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={isSubmitting} containerClassName="justify-center">
                <InputOTPGroup className="justify-center mb-4">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button className="w-full rounded-full py-6 text-base" onClick={() => handleVerifyOtp()} disabled={isSubmitting || !otpReady}>
                {tOtp('title')}
              </Button>

              <Button
                className="w-full"
                variant="secondary"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await authOtpService.request(email);
                    toast.success(tOtp('resent'))
                  } catch {
                    toast.error(tOtp('resendFailed'))
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || !email}
              >
                {tOtp('resend')}
              </Button>

              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                }}
                disabled={isSubmitting}
              >
                {t('back')}
              </Button>
            </div>
          </div>
        )}
      </Content>
    </Root>
  );
}
