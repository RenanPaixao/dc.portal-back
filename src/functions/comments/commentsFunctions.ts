import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { comments } from '../../db/schema.js'
import type { ReqQueryParams } from '../types.js'

export const getCommentsByCourseId = async (id: string, options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(comments).where(eq(comments.courseId, id)).offset(offset).limit(limit)
}

export const getCommentsByProfessorId = async (id: string, options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(comments).where(eq(comments.professorId, id)).offset(offset).limit(limit)
}

export const addComment = async (comment: typeof comments.$inferInsert) => {
  return db.insert(comments).values(comment)
}

export const deleteComment = async (id: string) => {
  return db.delete(comments).where(eq(comments.id, id))
}

export const getAllComments = async (options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(comments).offset(offset).limit(limit)
}
