import { Hono } from 'hono'
import prisma from './db'
import { authMiddleware } from './auth'

const user = new Hono()

// Get Profile
user.get('/:id/profile', async (c) => {
  const id = c.req.param('id')

  const profile = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          followedBy: true,
          following: true,
          posts: true,
          recipes: true
        }
      }
    }
  })

  if (!profile) return c.json({ error: 'User not found' }, 404)

  return c.json(profile)
})

// Get Cooking Activity Graph (Last 365 days)
user.get('/:id/activity', async (c) => {
  const id = c.req.param('id')

  // Aggregate posts by date
  // For SQLite, we might need raw query or JS processing.
  // Using JS processing for simplicity and database agnostic approach for this scale.

  const posts = await prisma.post.findMany({
    where: {
      authorId: id,
      createdAt: {
        gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      }
    },
    select: { createdAt: true }
  })

  const activity: Record<string, number> = {}

  posts.forEach(post => {
    const date = post.createdAt.toISOString().split('T')[0]
    activity[date] = (activity[date] || 0) + 1
  })

  return c.json(activity)
})

// Follow User
user.post('/:id/follow', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const targetId = c.req.param('id')

  if (currentUser.id === targetId) {
    return c.json({ error: 'Cannot follow yourself' }, 400)
  }

  await prisma.follows.create({
    data: {
      followerId: currentUser.id,
      followingId: targetId
    }
  })

  return c.json({ success: true })
})

// Unfollow User
user.delete('/:id/follow', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const targetId = c.req.param('id')

  await prisma.follows.delete({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: targetId
      }
    }
  })

  return c.json({ success: true })
})

export default user

