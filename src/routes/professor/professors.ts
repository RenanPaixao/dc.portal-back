import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getCommentsByProfessorId } from '../../functions/comments/commentsFunctions.js'
import {
  getAllProfessors,
  getProfessorById,
  getProfessorCourses,
  getProfessorsCount,
  searchByProfessors
} from '../../functions/professor/professorFunctions.js'

export const professorsRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/professors',
    schema: {
      querystring: z.object({
        offset: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        search: z.string().optional(),
        count: z.string().optional(),
      }),
    },
    handler: async (req, res) => {
      if (req.query.search) {
        const searchedProfessors = await searchByProfessors(req.query.search, {
          limit: req.query.limit,
          offset: req.query.offset,
        })

        return res.send(searchedProfessors)
      }

      const professors = await getAllProfessors(req.query)
      const count = req.query.count === 'true' ? await getProfessorsCount() : null
      return res.send({
        professors,
        count: count?.[0].count ?? null,
      })
    },
  })

  app.route({
    method: 'GET',
    url: '/professors/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async request => {
      return getProfessorById(request.params.id)
    },
  })

  app.route({
    method: 'GET',
    url: '/professors/:id/comments',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async request => {
      return getCommentsByProfessorId(request.params.id)
    },
  })
  
  app.route({
    method: 'GET',
    url: '/professors/:id/courses',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async request => {
      return getProfessorCourses(request.params.id)
    },
  })
}
