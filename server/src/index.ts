import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from './auth'
import wiki from './wiki'
import social from './social'
import user from './user'
import smart from './smart'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', auth)
app.route('/wiki', wiki)
app.route('/social', social)
app.route('/users', user)
app.route('/smart', smart)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
