import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getAllCourses, getCourseById } from '../../functions/course/courseFunctions.js'

export const coursesRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/courses',
    handler: async (_req, res) => {
      const courses = await getAllCourses()
      return res.send(courses)
    },
  })

  app.route({
    method: 'GET',
    url: '/courses/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async request => {
      return getCourseById(request.params.id)
    },
  })
}
