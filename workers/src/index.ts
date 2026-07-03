import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './auth'
import music from './music'

type Bindings = {
  SESSION: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// 健康检查
app.get('/', (c) => c.json({ status: 'ok', service: 'netease-api' }))

// 挂载路由
app.route('/api', auth)
app.route('/api', music)

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

export default app
