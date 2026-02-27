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
import { Separator } from '@/components/ui/separator';
import { toApiErrorPayload } from '@/data/api-error';
import { useIsMobile } from '@/hooks/use-mobile';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUpClick?: () => void;
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

export function SignInDialog({ open, onOpenChange, onSignUpClick }: SignInDialogProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOtpAttempt, setLastOtpAttempt] = useState<string | null>(null);

  const otpReady = useMemo(() => otp.replace(/\D/g, '').length === 6, [otp]);

  useEffect(() => {
    if (!open) {
      setStep('credentials');
      setEmail('');
      setPassword('');
      setOtp('');
      setIsSubmitting(false);
      setLastOtpAttempt(null);
    }
  }, [open]);

  useEffect(() => {
    // if user changes code, allow a new auto-attempt
    const value = otp.replace(/\D/g, '');
    if (value.length !== 6) {
      setLastOtpAttempt(null);
    }
  }, [otp]);

  async function finalizeLogin(token: string) {
    await authPasswordService.storeToken(token);
    onOpenChange(false);
    router.push('/chat');
  }

  async function handlePasswordLogin() {
    if (!email || !password) {
      toast.error('Informe email e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authPasswordService.login({ email, password });

      if (res?.otpRequired) {
        await authOtpService.request(email);
        setStep('otp');
        return;
      }

      if (!res?.token) throw new Error('missing_token');
      await finalizeLogin(res.token);
    } catch (e) {
      toast.error(toApiErrorPayload(e).error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(code?: string) {
    const value = (code ?? otp).replace(/\D/g, '');
    if (value.length !== 6) {
      toast.error('Informe o código de 6 dígitos.');
      return;
    }

    // Prevent auto-submit loops: do not retry the same code automatically.
    if (lastOtpAttempt === value) {
      return;
    }
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
            {step === 'otp' ? 'Digite o código enviado para seu email.' : 'Faça login para começar a conversar.'}
          </Description>
        </Header>
        {step === 'credentials' ? (
          <div className="space-y-3 p-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <Button variant='secondary' className="w-full" onClick={handlePasswordLogin} disabled={isSubmitting}>
              Entrar
            </Button>

            {onSignUpClick && (
              <Button
                className="w-full text-muted-foreground"
                variant="link"
                onClick={() => {
                  onOpenChange(false);
                  onSignUpClick();
                }}
                disabled={isSubmitting}
              >
                Criar conta
              </Button>
            )}
            <Button
              className="w-full bg-white text-black hover:bg-white/95"
              onClick={signInWithGoogle}
              disabled={isSubmitting}
            >
              <span className="flex items-center justify-center gap-2">
                <Image alt="Google" height={14} src="/logos/google.svg" width={14} />
                <span>Entrar com o Google</span>
              </span>
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <Image src="/logos/pumkin.svg" alt="Logo" width={40} height={40} priority quality={100} />
              </div>
              <h2 className="text-2xl font-semibold">Confirm your code</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Digite o código de 6 dígitos que enviamos para seu email.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isSubmitting}
                containerClassName="justify-center"
                className=""
              >
                <InputOTPGroup className="justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button className="w-full rounded-full py-6 text-base" onClick={() => handleVerifyOtp()} disabled={isSubmitting || !otpReady}>
                Confirmar
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await authOtpService.request(email);
                    toast.success('Código reenviado.');
                  } catch {
                    toast.error('Falha ao reenviar código.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || !email}
              >
                Reenviar código
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
                Voltar
              </Button>
            </div>
          </div>
        )}
      </Content>
    </Root>
  );
}
