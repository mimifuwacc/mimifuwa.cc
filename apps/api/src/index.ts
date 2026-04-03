import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createYogaServer } from './graphql/yoga'
import type { Env, Context } from './types'

const app = new Hono<{ Bindings: Env }>()

// CORS for development
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// GraphQL Yoga
const yoga = createYogaServer()

app.use('/graphql/*', async (c) => {
  const response = await yoga.handle(
    new Request(c.req.raw),
    {
      env: c.env,
      request: c.req.raw,
    } as Context
  ) as unknown as Response

  // Return the response properly
  return new Response(response.body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  })
})

export default app
