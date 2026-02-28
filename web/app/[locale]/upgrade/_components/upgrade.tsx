"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from 'react';
import { subscriptionService } from '@/data/subscription';
import { stripeService } from '@/data/stripe';
import { ArrowLeft01Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl';

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
  clientSecret: string
  intentType: 'payment' | 'setup'
  isConfirming: boolean
  onConfirmingChange: (next: boolean) => void
  onSuccess: () => Promise<void>
}) {
  const t = useTranslations('upgrade')
  const stripe = useStripe()
  const elements = useElements()
  const isSubmittingRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    if (isSubmittingRef.current) return
    if (props.isConfirming) return
    isSubmittingRef.current = true

    props.onConfirmingChange(true)
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        toast.error(submitError.message || t('invalidPayment'))
        return
      }

      if (props.intentType === 'payment') {
        const { paymentIntent } = await stripe.retrievePaymentIntent(props.clientSecret)
        if (paymentIntent?.status === 'succeeded') {
          await props.onSuccess()
          return
        }
      }

      if (props.intentType === 'setup') {
        const { setupIntent } = await stripe.retrieveSetupIntent(props.clientSecret)
        if (setupIntent?.status === 'succeeded') {
          await props.onSuccess()
          return
        }
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
        const code = (res.error as unknown as { code?: string })?.code
        if (code === 'payment_intent_unexpected_state') {
          await props.onSuccess()
          return
        }
        toast.error(res.error.message || t('confirmFailed'))
        return
      }

      await props.onSuccess()
    } finally {
      props.onConfirmingChange(false)
      isSubmittingRef.current = false
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
          ? <Icon icon={Loading03Icon} className="animate-spin size-4" />
          : t('confirmPayment')}
      </Button>
    </form>
  )
}

export function UpgradeCheckoutPage(props: {
  plan: 'pro_monthly' | 'pro_yearly'
  returnTo?: string
  coupon?: string
}) {
  console.log('[UpgradeCheckoutPage] Props:', props)
  const t = useTranslations('upgrade')
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasCheckoutError, setHasCheckoutError] = useState(false)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'payment' | 'setup' | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const lastIntentKeyRef = useRef<string | null>(null)
  const intentAttemptIdRef = useRef<string | null>(null)

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
    lastIntentKeyRef.current = null
    intentAttemptIdRef.current = null
  }, [props.plan, props.coupon])

  const createSubscription = async () => {
    if (!stripePublishableKey) {
      toast.error(t('unavailable'))
      return
    }

    setIsCreating(true);
    try {
      await subscriptionService.deleteIncomplete().catch(() => null);
      if (!intentAttemptIdRef.current) {
        intentAttemptIdRef.current =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`
      }
      const requestId = `${props.plan}:${intentAttemptIdRef.current}`
      const body = await stripeService.createSubscriptionIntent(props.plan, requestId, props.coupon);
      if (!body?.clientSecret || !body?.intentType) throw new Error('Client secret ausente');
      setClientSecret(body.clientSecret);
      setIntentType(body.intentType);
    } catch (error) {
      setHasCheckoutError(true)
      toast.error(t('createFailed'))
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    if (clientSecret) return
    if (isCreating) return
    if (hasCheckoutError) return
    const key = `${props.plan}:${props.coupon ?? 'no-coupon'}:${typeof window !== 'undefined' ? window.location.pathname : 'upgrade'}`
    if (lastIntentKeyRef.current === key) return
    lastIntentKeyRef.current = key
    void createSubscription()
  }, [clientSecret, hasCheckoutError, isCreating, props.plan, props.coupon])

  const openBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const body = await stripeService.createPortal();
      if (!body?.url) throw new Error('URL do portal ausente');
      window.location.href = body.url;
    } catch (error) {
      toast.error(t('portalFailed'))
    } finally {
      setIsOpeningPortal(false);
    }
  }

  const checkout = (
    <div className="w-full max-w-md mx-auto p-3">
      {clientSecret && checkoutOptions && stripePromise && (
        <Elements stripe={stripePromise} options={checkoutOptions}>
          <CheckoutForm
            clientSecret={clientSecret}
            intentType={intentType ?? 'payment'}
            isConfirming={isConfirming}
            onConfirmingChange={setIsConfirming}
            onSuccess={async () => {
              await subscriptionService.get().catch(() => null)
              const returnTo =
                props.returnTo && props.returnTo.startsWith('/')
                  ? props.returnTo
                  : '/chat'
              router.push(returnTo)
            }}
          />
        </Elements>
      )}
      {!checkoutOptions && !hasCheckoutError && (
        <Button className="mt-6 w-full border-0 bg-transparent!" disabled variant="outline">
          <Icon icon={Loading03Icon} className="animate-spin size-4" />
        </Button>
      )}
      {!checkoutOptions && hasCheckoutError && (
        <Button
          className="mt-6 w-full"
          onClick={createSubscription}
          disabled={isCreating}
        >
          {isCreating
            ? <Icon icon={Loading03Icon} className="animate-spin size-4" />
            : t('tryAgain')}
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
            ? <Icon icon={Loading03Icon} className="animate-spin size-4" />
            : t('manageSubscription')}
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
        <Icon icon={ArrowLeft01Icon} className="size-5" />
      </Button>
      <div className="min-h-[calc(100vh-2rem)] w-full grid place-items-center">
        {checkout}
      </div>
    </div>
  )
}
