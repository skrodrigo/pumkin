"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'
import { useEffect, useState } from 'react';
import { subscriptionService } from '@/data/subscription';
import { stripeService } from '@/data/stripe';
import type { StripePriceInfo } from '@/data/stripe'
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'

interface UpgradePageProps {
  onClose: () => void;
}

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null


function getStripeAppearance() {

  return {
    variables: {
      colorPrimary: '#f0c692',
      colorDanger: '#ef4444',
      borderRadius: '16px',
      colorBackground: '#151517',
      colorText: 'white',
      spacingUnit: '6px',
      colorTextSecondary: 'white',
    },
    rules: {
      '.Block': {
        boxShadow: 'none',
      },
      '.Input': {
        backgroundColor: '#0c0c0c',
        borderColor: '#27272a',
        border: '0px solid',
        boxShadow: 'none',
        color: '#ffffff',
      },
      '.Label': {
        color: '#a1a1aa',
        boxShadow: 'none',
      },
      '.Tab': {
        backgroundColor: '#0c0c0c',
        borderColor: '#27272a',
        boxShadow: 'none',
      },
    },
  }
}

function CheckoutForm(props: {
  intentType: 'payment' | 'setup'
  isConfirming: boolean
  onConfirmingChange: (next: boolean) => void
  onSuccess: () => Promise<void>
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    props.onConfirmingChange(true)
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast.error(submitError.message || 'Pagamento inválido')
        return
      }

      const confirmParams = {
        return_url: window.location.href,
      }

      const res = props.intentType === 'setup'
        ? await stripe.confirmSetup({
          elements,
          confirmParams,
          redirect: 'if_required',
        })
        : await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required',
        })

      if (res.error) {
        toast.error(res.error.message || 'Falha ao confirmar pagamento')
        return
      }

      await props.onSuccess()
    } finally {
      props.onConfirmingChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <PaymentElement />
      <Button
        className="w-full"
        type="submit"
        disabled={!stripe || props.isConfirming}
      >
        {props.isConfirming
          ? <Loader2Icon className="animate-spin size-4" />
          : 'Confirmar pagamento'}
      </Button>
    </form>
  )
}

function PlanPicker(props: {
  value: 'pro_monthly' | 'pro_yearly'
  onValueChange: (next: 'pro_monthly' | 'pro_yearly') => void
  onUpgrade: () => void
  isUpgrading: boolean
  monthlyPrice: StripePriceInfo | null
  yearlyPrice: StripePriceInfo | null
  isLoadingPrices: boolean
}) {
  const monthlyLabel = props.monthlyPrice?.unitAmount
    ? `R$${(props.monthlyPrice.unitAmount / 100).toFixed(2).replace('.', ',')}`
    : null
  const yearlyLabel = props.yearlyPrice?.unitAmount
    ? `R$${(props.yearlyPrice.unitAmount / 100).toFixed(2).replace('.', ',')}`
    : null

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <RadioGroup
        value={props.value}
        onValueChange={(v) => props.onValueChange(v as any)}
        className="grid gap-3"
      >
        <label
          className={
            `flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-colors ` +
            (props.value === 'pro_monthly'
              ? 'border-primary'
              : 'border-border')
          }
          data-checked={props.value === 'pro_monthly'}
        >
          <RadioGroupItem value="pro_monthly" />
          <div className="flex-1">
            <div className="font-semibold">Pro</div>
            <div className="text-sm text-muted-foreground">Billed monthly</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">
              {props.isLoadingPrices
                ? <Skeleton className="h-5 w-14 mb-1" />
                : monthlyLabel ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground">/month</div>
          </div>
        </label>
        <label
          className={
            `flex items-center gap-3 rounded-sm border p-4 cursor-pointer transition-colors ` +
            (props.value === 'pro_yearly'
              ? 'border-primary'
              : 'border-border')
          }
          data-checked={props.value === 'pro_yearly'}
        >
          <RadioGroupItem value="pro_yearly" />
          <div className="flex-1">
            <div className="font-semibold">Pro Annual</div>
            <div className="text-sm text-muted-foreground">Billed yearly</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">
              {props.isLoadingPrices
                ? <Skeleton className="h-5 w-16 mb-1" />
                : yearlyLabel ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground">/year</div>
          </div>
        </label>
      </RadioGroup>
      <Button
        className="mt-6 w-full"
        onClick={props.onUpgrade}
        disabled={props.isUpgrading}
      >
        {props.isUpgrading
          ? <Loader2Icon className="animate-spin size-4" />
          : 'Continuar'}
      </Button>
    </div>
  )
}

export function UpgradePage({ onClose }: UpgradePageProps) {
  const isMobile = useIsMobile()
  const [isPlanPickerOpen, setIsPlanPickerOpen] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_yearly'>(
    'pro_yearly',
  )
  const [monthlyPrice, setMonthlyPrice] = useState<StripePriceInfo | null>(null)
  const [yearlyPrice, setYearlyPrice] = useState<StripePriceInfo | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'payment' | 'setup' | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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

  useEffect(() => {
    async function loadPrices() {
      setIsLoadingPrices(true)
      try {
        const prices = await stripeService.getPrices()
        setMonthlyPrice(prices.pro_monthly)
        setYearlyPrice(prices.pro_yearly)
      } catch {
        setMonthlyPrice(null)
        setYearlyPrice(null)
      } finally {
        setIsLoadingPrices(false)
      }
    }
    loadPrices()
  }, [])

  const handleClose = () => {
    setIsPlanPickerOpen(false)
    setIsCheckoutOpen(false)
    setClientSecret(null)
    setIntentType(null)
    setIsConfirming(false)
    onClose()
  }

  const checkoutOptions = clientSecret
    ? {
      clientSecret,
      appearance: getStripeAppearance(),
    }
    : null

  const createSubscription = async () => {
    if (!stripePublishableKey) {
      toast.error('Pagamento indisponível no momento.')
      return
    }

    setIsCreating(true);
    try {
      await subscriptionService.deleteIncomplete().catch(() => null);
      const body = await stripeService.createSubscriptionIntent(selectedPlan);
      if (!body?.clientSecret || !body?.intentType) throw new Error('Missing client secret');
      setClientSecret(body.clientSecret);
      setIntentType(body.intentType);
      setIsPlanPickerOpen(false)
      setIsCheckoutOpen(true)
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

  const planPicker = (
    <PlanPicker
      value={selectedPlan}
      onValueChange={setSelectedPlan}
      onUpgrade={createSubscription}
      isUpgrading={isCreating}
      monthlyPrice={monthlyPrice}
      yearlyPrice={yearlyPrice}
      isLoadingPrices={isLoadingPrices}
    />
  )

  const checkout = (
    <div className="w-full max-w-md mx-auto p-3">
      {checkoutOptions && stripePromise && (
        <Elements stripe={stripePromise} options={checkoutOptions}>
          <CheckoutForm
            intentType={intentType ?? 'payment'}
            isConfirming={isConfirming}
            onConfirmingChange={setIsConfirming}
            onSuccess={async () => {
              await subscriptionService.get().catch(() => null)
              handleClose()
            }}
          />
        </Elements>
      )}
      {isSubscribed && (
        <Button
          className="mt-3 w-full"
          variant="secondary"
          onClick={openBillingPortal}
          disabled={isOpeningPortal}
        >
          {isOpeningPortal
            ? <Loader2Icon className="animate-spin size-4" />
            : 'Gerenciar assinatura'}
        </Button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={isPlanPickerOpen} onOpenChange={(open) => {
          if (!open) handleClose()
          setIsPlanPickerOpen(open)
        }}>
          <DrawerContent>
            {planPicker}
          </DrawerContent>
        </Drawer>
        <Drawer open={isCheckoutOpen} onOpenChange={(open) => {
          if (!open) handleClose()
          setIsCheckoutOpen(open)
        }}>
          <DrawerContent className="">
            {checkout}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <>
      <Dialog open={isPlanPickerOpen} onOpenChange={(open) => {
        if (!open) handleClose()
        setIsPlanPickerOpen(open)
      }}>
        <DialogContent>
          {planPicker}
        </DialogContent>
      </Dialog>
      <Dialog open={isCheckoutOpen} onOpenChange={(open) => {
        if (!open) handleClose()
        setIsCheckoutOpen(open)
      }}>
        <DialogContent>
          {checkout}
        </DialogContent>
      </Dialog>
    </>
  )
}
