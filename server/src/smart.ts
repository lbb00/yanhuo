import { Hono } from 'hono'
import prisma from './db'

const smart = new Hono()

// Recommend Recipes based on Ingredients
smart.post('/recommend', async (c) => {
  const { ingredients } = await c.req.json<{ ingredients: string[] }>()

  if (!ingredients || ingredients.length === 0) {
    return c.json({ error: 'Please provide ingredients' }, 400)
  }

  // 1. Find Ingredient IDs from names
  const dbIngredients = await prisma.ingredient.findMany({
    where: {
      name: { in: ingredients }
    }
  })

  const ingredientIds = dbIngredients.map(i => i.id)

  if (ingredientIds.length === 0) {
    return c.json([]) // No matching ingredients found in DB
  }

  // 2. Find Recipes that contain these ingredients
  // This is a bit complex in standard ORM. We'll fetch candidates first.
  // Candidate recipes: Contain at least one of the ingredients.

  const recipes = await prisma.recipe.findMany({
    where: {
      ingredients: {
        some: {
          ingredientId: { in: ingredientIds }
        }
      }
    },
    include: {
      ingredients: {
        include: {
          ingredient: true
        }
      },
      author: {
        select: { nickname: true, avatar: true }
      }
    }
  })

  // 3. Rank them
  const results = recipes.map(recipe => {
    // Count how many input ingredients match recipe ingredients
    const matchCount = recipe.ingredients.filter(ri =>
      ingredients.includes(ri.ingredient.name)
    ).length

    const totalIngredients = recipe.ingredients.length
    const missingCount = totalIngredients - matchCount

    // Simple Score: Higher match count is better.
    // If tie, lower missing count is better.
    return {
      ...recipe,
      matchCount,
      missingCount
    }
  })

  // Sort: Match Count DESC, Missing Count ASC
  results.sort((a, b) => {
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount
    }
    return a.missingCount - b.missingCount
  })

  return c.json(results)
})

export default smart

