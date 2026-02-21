export type StripePlan = 'pro_monthly' | 'pro_yearly';

export const stripeService = {
  async createCheckout(plan: StripePlan) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }

    return res.json() as Promise<{ id: string; url: string }>;
  },

  async createPortal() {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }

    return res.json() as Promise<{ url: string }>;
  },

  async cancel() {
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const code = body?.statusCode ?? res.status;
      throw new Error(JSON.stringify({ statusCode: code, error: body?.error || `Request failed (${code})` }));
    }

    return res.json() as Promise<{ success: boolean }>;
  },
};
