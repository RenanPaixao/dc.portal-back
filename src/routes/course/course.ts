import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getCommentsByCourseId } from '../../functions/comments/commentsFunctions.js'
import {
  getAllCourses,
  getCourseById,
  getCourseRating,
  searchByCourses
} from '../../functions/course/courseFunctions.js'

export const coursesRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/courses',
    schema: {
      querystring: z.object({
        offset: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        search: z.string().optional()
      }),
    },
    handler: async (req, res) => {
      try {
      
      if(req.query.search){
        const coursesSearched = await searchByCourses(req.query.search, {
          offset: req.query.offset,
          limit: req.query.limit
        })
        
        return res.send(coursesSearched)
      }
      
      const courses = await getAllCourses(req.query)
      return res.send(courses)
      
      }catch(e) {
        console.error(e)
        
        return res.code(500).send({
          error: e
        })
      }
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
  
  app.route({
    method: 'GET',
    url: '/courses/:id/comments',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async request => {
      return getCommentsByCourseId(request.params.id)
    },
  })
  
  app.route({
    method: 'GET',
    url: '/courses/:id/rating',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async (req, rep) => {
      const rating = await getCourseRating(req.params.id)
      
      return rep.send({
        rating
      })
    },
  })
}
