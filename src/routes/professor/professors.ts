import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getAllProfessors, getProfessorById, searchByProfessors } from '../../functions/professor/professorFunctions.js'

export const professorsRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/professors',
    schema: {
      querystring: z.object({
        offset: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
        search: z.string().optional()
      }),
    },
    handler: async (req, res) => {
      if(req.query.search){
        const searchedProfessors = await searchByProfessors(req.query.search, {
          limit: req.query.limit,
          offset: req.query.offset
        })
        
        return res.send(searchedProfessors)
      }
      const professors = await getAllProfessors(req.query)
      return res.send(professors)
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
}
