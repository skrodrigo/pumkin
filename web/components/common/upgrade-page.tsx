"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { subscriptionService } from '@/data/subscription';
import { stripeService } from '@/data/stripe';
import { BotMessageSquare, FileUp, Zap, Search, BrainCircuit, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradePageProps {
  onClose: () => void;
}


const proFeatures = [
  { text: 'Acesso a todos os modelos (GPT-5, Claude 4, etc)', icon: <BrainCircuit className="size-5 text-primary" /> },
  { text: 'Mais mensagens e carregamentos', icon: <FileUp className="size-5 text-primary" /> },
  { text: 'Respostas mais rápidas', icon: <Zap className="size-5 text-primary" /> },
  { text: 'Pesquisa na web avançada', icon: <Search className="size-5 text-primary" /> },
  { text: 'Memória e contexto aprimorados', icon: <BotMessageSquare className="size-5 text-primary" /> },
];

export function UpgradePage({ onClose }: UpgradePageProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const subscription = await subscriptionService.get();
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
        setIsSubscribed(isActive && subscription?.plan?.toLowerCase() === 'pro');
      } catch {
        setIsSubscribed(false);
      }
    }
    checkSubscription();
  }, []);

  const createSubscription = async () => {
    setIsCreating(true);
    try {
      const body = await stripeService.createCheckout('pro_monthly');
      if (!body?.url) throw new Error('Missing checkout url');
      window.location.href = body.url;
    } catch (error) {
      toast.error('Falha ao criar assinatura. Por favor, tente novamente.');
    } finally {
      setIsCreating(false);
    }
  }

  const openBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const body = await stripeService.createPortal();
      if (!body?.url) throw new Error('Missing portal url');
      window.location.href = body.url;
    } catch (error) {
      toast.error('Falha ao abrir o portal de cobrança. Por favor, tente novamente.');
    } finally {
      setIsOpeningPortal(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <div className="w-full max-w-md mx-auto p-4 sm:p-6">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-3xl tracking-tight">Plano</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Faça upgrade para desbloquear o uso de todos os modelos e mais funcionalidades.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-8 border p-1 rounded-md">
            <div className="border border-border rounded-md p-8 flex flex-col relative bg-sidebar">
              <div className="absolute top-0 right-4 -mt-3">
                <div className="bg-primary/5 backdrop-blur-3xl border border-primary text-primary text-xs font-semibold px-3 py-1 rounded-full">POPULAR</div>
              </div>
              <h2 className="text-2xl font-semibold">Pro</h2>
              <p className="mt-4 text-muted-foreground">Mais acesso à inteligência avançada</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">R$39,90</span>
                <span className="ml-2 text-muted-foreground">/ mês</span>
              </div>
              <Button className="mt-8 w-full" onClick={createSubscription} disabled={isSubscribed || isCreating}>
                {isCreating ? <Loader2Icon className="animate-spin size-4" /> : isSubscribed ? 'Seu plano atual' : 'Assinar Pro'}
              </Button>

              {isSubscribed && (
                <Button
                  className="mt-3 w-full"
                  variant="secondary"
                  onClick={openBillingPortal}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? <Loader2Icon className="animate-spin size-4" /> : 'Gerenciar assinatura'}
                </Button>
              )}
              <ul className="mt-8 space-y-4 text-sm">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.icon}
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
