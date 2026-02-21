'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authOtpService, authPasswordService } from '@/data/auth-otp';
import { toApiErrorPayload } from '@/data/api-error';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SignUpDialog({ open, onOpenChange }: SignUpDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOtpAttempt, setLastOtpAttempt] = useState<string | null>(null);

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
      toast.error('Informe nome, email e senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authPasswordService.register({ name, email, password });

      if (res?.otpRequired) {
        setStep('otp');
        toast.success('Enviamos um código para seu email.');
        return;
      }

      // Safe fallback
      await authOtpService.request(email);
      setStep('otp');
      toast.success('Enviamos um código para seu email.');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle />
        <DialogHeader className="flex flex-col items-center text-center">
          <Image src="/logos/nexus.svg" alt="Logo" width={32} height={32} className="mb-4" priority quality={100} />
          <DialogDescription>
            {step === 'otp' ? 'Digite o código enviado para seu email.' : 'Crie sua conta para começar a conversar.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'credentials' ? (
          <div className="space-y-3 p-4">
            <Button
              className="w-full bg-white border hover:bg-accent/80 border-border text-black"
              onClick={signInWithGoogle}
              disabled={isSubmitting}
            >
              <Image alt="Google" className="mr-2" height={16} src="/logos/google.svg" width={16} />
              Continuar com Google
            </Button>
            <Button
              variant="secondary"
              className="w-full bg-black hover:bg-black/80 border text-white"
              onClick={signInWithGoogle}
              disabled={isSubmitting}
            >
              <Image alt="apple" className="mr-2" height={16} src="/logos/apple.svg" width={16} />
              Continuar com Apple
            </Button>
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
            />
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
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <Button variant="secondary" className="w-full" onClick={handleRegister} disabled={isSubmitting}>
              Criar conta
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
      </DialogContent>
    </Dialog>
  );
}
