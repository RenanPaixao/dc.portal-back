import { eq, ilike } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { comments, courses } from '../../db/schema.js'

interface ReqQueryParams {
  offset?: number
  limit?: number
}

export const getAllCourses = async (options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(courses).offset(offset).limit(limit)
}

export const searchByCourses = (term: string, options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}
  
  return db.select().from(courses).where(ilike(courses.name, `%${term}%`)).offset(offset).limit(limit)
}

export const getCourseById = async (id: string) => {
  return db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .then(res => res[0])
}

export const getCourseRating = async (id: string) => {
  const allComments = await db.select().from(comments).where(eq(comments.courseId, id))
  
  console.log(allComments)
  return allComments.reduce((acc, comment) => acc + comment.rating, 0) / allComments.length
}
