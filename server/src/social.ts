import { Hono } from 'hono'
import prisma from './db'
import { authMiddleware } from './auth'
import { ulid } from 'ulidx'

const social = new Hono()

// --- Posts ---

// Get Feed (Public posts)
social.get('/feed', async (c) => {
  const limit = Number(c.req.query('limit')) || 20
  const cursor = c.req.query('cursor')

  const posts = await prisma.post.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where: {
      visibility: 'PUBLIC'
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      },
      recipe: {
        select: { id: true, title: true, image: true }
      },
      _count: {
        select: { comments: true }
      }
    }
  })

  return c.json(posts)
})

// Get Post Detail
social.get('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      },
      recipe: {
        select: { id: true, title: true, image: true }
      },
      _count: {
        select: { comments: true }
      }
    }
  })

  if (!post) return c.json({ error: 'Post not found' }, 404)

  // Privacy check could happen here (if PRIVATE and not author)

  return c.json(post)
})

// Create Post (Protected)
social.post('/posts', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  const post = await prisma.post.create({
    data: {
      id: ulid(),
      content: body.content,
      images: body.images ? JSON.stringify(body.images) : '[]',
      visibility: body.visibility || 'PUBLIC',
      authorId: user.id,
      recipeId: body.recipeId
    }
  })

  return c.json(post)
})

// --- Comments ---

// Get Comments for a Post
social.get('/posts/:id/comments', async (c) => {
  const postId = c.req.param('id')

  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null }, // Fetch top-level comments first
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      },
      replies: {
        include: {
          author: {
            select: { id: true, nickname: true, avatar: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return c.json(comments)
})

// Create Comment (Protected)
social.post('/posts/:id/comments', authMiddleware, async (c) => {
  const user = c.get('user')
  const postId = c.req.param('id')
  const body = await c.req.json()

  if (!body.content) return c.json({ error: 'Content required' }, 400)

  const comment = await prisma.comment.create({
    data: {
      id: ulid(),
      content: body.content,
      postId,
      authorId: user.id,
      parentId: body.parentId
    },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      }
    }
  })

  return c.json(comment)
})

// --- Mock Upload ---
// In a real app, this would upload to S3/OSS and return a URL
social.post('/upload', authMiddleware, async (c) => {
  // For simplicity in this dev environment, we'll just mock it
  // and return a placeholder URL or the data URL if small
  // But strictly speaking, handling multipart in Hono Node server requires some setup
  // For now, we assume the client sends a base64 or we just return a dummy URL.

  // Real implementation would parse formData.
  // const body = await c.req.parseBody()
  // const image = body['file']

  return c.json({
    url: 'https://placehold.co/600x400?text=Uploaded+Image'
  })
})

export default social

