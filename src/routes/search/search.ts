import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { search } from '../../functions/search/search.js'

export const searchRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/search',
    schema: {
      querystring: z.object({
        search: z.string().optional(),
        offset: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }),
    },
    handler: async (req, res) => {
      const results = await search(req.query.search ?? '', {
        offset: req.query.offset,
        limit: req.query.limit,
      })
      return res.send(results)
    },
  })
}
