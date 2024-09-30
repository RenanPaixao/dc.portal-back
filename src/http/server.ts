import postgres from '@fastify/postgres'
import fastify from 'fastify'

const app = fastify()
const PORT = 8888

app.register(postgres, {})
app.listen({ port: PORT }).then(() => {
  console.log(`Server listening on port ${PORT}`)
})
