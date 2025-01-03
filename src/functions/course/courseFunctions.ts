import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courses } from '../../db/schema.js'

interface ReqQueryParams {
  offset?: number
  limit?: number
}

export const getAllCourses = async (options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(courses).offset(offset).limit(limit)
}

export const getCourseById = async (id: string) => {
  return db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .then(res => res[0])
}
