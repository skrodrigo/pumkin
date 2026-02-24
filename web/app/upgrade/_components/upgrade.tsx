"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { subscriptionService } from '@/data/subscription';
import { stripeService } from '@/data/stripe';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null


function getStripeAppearance() {

  return {
    variables: {
      colorPrimary: '#f0c692',
      colorDanger: '#ef4444',
      borderRadius: '12px',
      colorBackground: '#151517',
      colorText: 'white',
      spacingUnit: '4px',
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

export function UpgradeCheckoutPage(props: {
  plan: 'pro_monthly' | 'pro_yearly'
}) {
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasCheckoutError, setHasCheckoutError] = useState(false)
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

  const goBack = () => router.back()

  const checkoutOptions = clientSecret
    ? {
      clientSecret,
      appearance: getStripeAppearance(),
    }
    : null

  useEffect(() => {
    setClientSecret(null)
    setIntentType(null)
    setHasCheckoutError(false)
  }, [props.plan])

  const createSubscription = async () => {
    if (!stripePublishableKey) {
      toast.error('Pagamento indisponível no momento.')
      return
    }

    setIsCreating(true);
    try {
      await subscriptionService.deleteIncomplete().catch(() => null);
      const body = await stripeService.createSubscriptionIntent(props.plan);
      if (!body?.clientSecret || !body?.intentType) throw new Error('Client secret ausente');
      setClientSecret(body.clientSecret);
      setIntentType(body.intentType);
    } catch (error) {
      setHasCheckoutError(true)
      toast.error('Falha ao criar assinatura. Por favor, tente novamente.');
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (clientSecret) return
    if (isCreating) return
    if (hasCheckoutError) return
    void createSubscription()
  }, [clientSecret, hasCheckoutError, isCreating])

  const openBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const body = await stripeService.createPortal();
      if (!body?.url) throw new Error('URL do portal ausente');
      window.location.href = body.url;
    } catch (error) {
      toast.error('Falha ao abrir o portal de cobrança. Por favor, tente novamente.');
    } finally {
      setIsOpeningPortal(false);
    }
  }

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
              router.back()
            }}
          />
        </Elements>
      )}
      {!checkoutOptions && !hasCheckoutError && (
        <Button className="mt-6 w-full border-0 bg-transparent!" disabled variant="outline">
          <Loader2Icon className="animate-spin size-4" />
        </Button>
      )}
      {!checkoutOptions && hasCheckoutError && (
        <Button
          className="mt-6 w-full"
          onClick={createSubscription}
          disabled={isCreating}
        >
          {isCreating
            ? <Loader2Icon className="animate-spin size-4" />
            : 'Tentar novamente'}
        </Button>
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

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full p-4 md:max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={goBack}
      >
        <ArrowLeft className="size-5" />
      </Button>
      <div className="min-h-[calc(100vh-2rem)] w-full grid place-items-center">
        {checkout}
      </div>
    </div>
  )
}
