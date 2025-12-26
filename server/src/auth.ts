import { Hono } from 'hono'
import prisma from './db'
import jwt from 'jsonwebtoken'
import { createMiddleware } from 'hono/factory'
import { ulid } from 'ulidx'

const auth = new Hono()

// Secret for JWT (should be in env)
const JWT_SECRET = process.env.JWT_SECRET || 'secret123'

// Types
type AuthUser = {
  id: string
  phone: string
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser
  }
}

// Middleware to protect routes
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser
    c.set('user', payload)
    await next()
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// Routes

// 1. Send Code (Mock)
auth.post('/send-code', async (c) => {
  const { phone } = await c.req.json<{ phone: string }>()
  if (!phone) return c.json({ error: 'Phone required' }, 400)

  // Mock: Just log it. Real world: Call SMS API.
  console.log(`[MockSMS] Code sent to ${phone}: 1234`)

  return c.json({ success: true, message: 'Code sent (use 1234)' })
})

// 2. Login / Register
auth.post('/login', async (c) => {
  const { phone, code } = await c.req.json<{ phone: string; code: string }>()

  if (!phone || !code) return c.json({ error: 'Phone and code required' }, 400)

  // Verify code (Mock)
  if (code !== '1234') {
    return c.json({ error: 'Invalid code' }, 400)
  }

  // Find or Create User
  let user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: ulid(),
        phone,
        nickname: `User_${phone.slice(-4)}`
      }
    })
  }

  // Generate Token
  const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

  return c.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar
    }
  })
})

// 3. Me
auth.get('/me', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const user = await prisma.user.findUnique({ where: { id: currentUser.id } })
  return c.json(user)
})

export default auth

