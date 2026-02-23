import { jsx } from 'react/jsx-runtime';
import { resend } from './../common/resend.js';
import { env } from './../common/env.js';

import OtpEmail from './../emails/otp-email.js';
import WelcomeEmail from './../emails/welcome-email.js';
import SubscriptionCanceledEmail from './../emails/subscription-canceled-email.js';
import DripEmail from './../emails/drip-email.js';

function appUrl(path: string) {
  const base = env.WEB_URL.replace(/\/$/, '');
  return `${base}${path}`;
}

export const emailService = {
  async sendOtp(params: { to: string; code: string }) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: 'Seu código de verificação',
      react: jsx(OtpEmail, { code: params.code, appUrl: appUrl('/?otp=1') }),
    });
  },

  async sendWelcome(params: { to: string; name: string }) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: 'Bem-vindo ao Pumkin',
      react: jsx(WelcomeEmail, { name: params.name, appUrl: appUrl('/chat') }),
    });
  },

  async sendSubscriptionCanceled(params: { to: string; name: string }) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: 'Sua assinatura foi cancelada',
      react: jsx(SubscriptionCanceledEmail, { name: params.name, appUrl: appUrl('/chat') }),
    });
  },

  async sendDrip(params: { to: string; name: string; day: 2 | 5 | 7 }) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: `Pumkin: acompanhamento (dia ${params.day})`,
      react: jsx(DripEmail, { name: params.name, day: params.day, appUrl: appUrl('/chat') }),
    });
  },
};
