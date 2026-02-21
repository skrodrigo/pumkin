import app from './../src/routes/routes.js';
import { withPrisma } from './../src/common/prisma.js';

app.use('*', withPrisma);

const port = Number(process.env.PORT ?? 3001);

export default {
  port,
  fetch: app.fetch,
};