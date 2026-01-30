import { Hono } from 'hono';
import { env } from './../common/env.js';
import { prisma } from './../common/prisma.js';
import { emailService } from './../services/email.service.js';

const jobsRouter = new Hono();

function requireJobSecret(c: any) {
  const secret = c.req.header('x-job-secret');
  return secret && secret === env.JOB_SECRET;
}

jobsRouter.post('/email-drip', async (c) => {
  if (!requireJobSecret(c)) return c.json({ error: 'Unauthorized' }, 401);

  const now = new Date();

  const candidates = await prisma.user.findMany({
    where: {
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  for (const u of candidates) {
    const days = Math.floor((now.getTime() - u.createdAt.getTime()) / (24 * 60 * 60 * 1000));
    const day = days === 2 ? 2 : days === 5 ? 5 : days === 7 ? 7 : null;
    if (!day) continue;

    const hasActiveSub = await prisma.subscription.findFirst({
      where: { referenceId: u.id, status: 'active' },
      select: { id: true },
    });
    if (hasActiveSub) continue;

    const campaignKey = `drip_day_${day}`;

    const alreadySent = await prisma.emailCampaignLog.findUnique({
      where: { userId_campaignKey: { userId: u.id, campaignKey } },
    });
    if (alreadySent) continue;

    await emailService.sendDrip({ to: u.email, name: u.name, day });

    await prisma.emailCampaignLog.create({
      data: { userId: u.id, campaignKey },
    });
  }

  return c.json({ ok: true }, 200);
});

export default jobsRouter;
