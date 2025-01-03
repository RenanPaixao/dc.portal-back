import postgres from '@fastify/postgres'
import fastify from 'fastify'
import { type ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { coursesRoute } from '../routes/course/course.js'

const app = fastify()
const PORT = 8888

app.register(postgres, {}).withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(coursesRoute)

app.listen({ port: PORT }).then(() => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
