import { Hono } from 'hono'
import prisma from './db'
import { authMiddleware } from './auth'
import { ulid } from 'ulidx'

const wiki = new Hono()

// --- Ingredients ---

// List Ingredients
wiki.get('/ingredients', async (c) => {
  const q = c.req.query('q')
  const category = c.req.query('category')

  const ingredients = await prisma.ingredient.findMany({
    where: {
      name: q ? { contains: q } : undefined,
      category: category ? { equals: category } : undefined,
    }
  })
  return c.json(ingredients)
})

// Get Ingredient
wiki.get('/ingredients/:id', async (c) => {
  const id = c.req.param('id')
  const ingredient = await prisma.ingredient.findUnique({ where: { id } })
  if (!ingredient) return c.json({ error: 'Not found' }, 404)
  return c.json(ingredient)
})

// Create Ingredient (Protected)
wiki.post('/ingredients', authMiddleware, async (c) => {
  const body = await c.req.json()
  // Minimal validation
  if (!body.name) return c.json({ error: 'Name required' }, 400)

  const ingredient = await prisma.ingredient.create({
    data: {
      id: ulid(),
      name: body.name,
      category: body.category,
      description: body.description,
      image: body.image,
      nutrition: body.nutrition ? JSON.stringify(body.nutrition) : undefined
    }
  })
  return c.json(ingredient)
})

// --- Recipes ---

// List Recipes
wiki.get('/recipes', async (c) => {
  const q = c.req.query('q')
  const recipes = await prisma.recipe.findMany({
    where: {
      title: q ? { contains: q } : undefined
    },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      }
    }
  })
  return c.json(recipes)
})

// Get Recipe Detail
wiki.get('/recipes/:id', async (c) => {
  const id = c.req.param('id')
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, nickname: true, avatar: true }
      },
      ingredients: {
        include: {
          ingredient: true
        }
      }
    }
  })
  if (!recipe) return c.json({ error: 'Not found' }, 404)

  // Parse steps if needed, but returning string is fine for now
  return c.json(recipe)
})

// Create Recipe (Protected)
wiki.post('/recipes', authMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  if (!body.title) return c.json({ error: 'Title required' }, 400)

  // Expecting ingredients as array of { ingredientId, amount }
  const ingredientItems = body.ingredients || []

  const recipe = await prisma.recipe.create({
    data: {
      id: ulid(),
      title: body.title,
      description: body.description,
      image: body.image,
      steps: body.steps ? JSON.stringify(body.steps) : '[]',
      authorId: user.id,
      ingredients: {
        create: ingredientItems.map((item: any) => ({
          id: ulid(),
          ingredientId: item.ingredientId,
          amount: item.amount
        }))
      }
    }
  })
  return c.json(recipe)
})

export default wiki

