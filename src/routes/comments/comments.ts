import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import type { comments } from '../../db/schema.js'
import { addComment, deleteComment, getAllComments } from '../../functions/comments/commentsFunctions.js'

export const commentsRoute: FastifyPluginAsyncZod = async app => {
  app.route({
    method: 'GET',
    url: '/comments',
    schema: {
      querystring: z.object({
        offset: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }),
    },
    handler: async (req, res) => {
      
      const comments = await getAllComments(req.query)
      return res.send(comments)
    },
  })
  
  app.route({
    method: 'POST',
    url: '/comments',
    handler: async (req, res) => {
      const body = z.custom<typeof comments.$inferInsert>().parse(req.body)
      const commentsResult = await addComment(body)
      return res.send(commentsResult)
    },
  })
  
  app.route({
    method: 'DELETE',
    url: '/comments/:id',
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
    handler: async (req, res) => {
      await deleteComment(req.params.id)
      return res.status(204).send()
    },
  })
}
