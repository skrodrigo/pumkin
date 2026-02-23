import app from './index.js'

const port = Number(process.env.PORT ?? 3001)

export default {
	port,
	idleTimeout: 255,
	fetch: app.fetch,
}
