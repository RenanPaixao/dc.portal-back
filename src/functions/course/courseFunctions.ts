import { and, count, eq, ilike, isNotNull } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { comments, courses } from '../../db/schema.js'
import type { ReqQueryParams } from '../types.js'

export const getAllCourses = async (options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(courses).offset(offset).limit(limit)
}

export const getCoursesCount = async () => {
  return db.select({ count: count() }).from(courses)
}

export const searchByCourses = (term: string, options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db
    .select()
    .from(courses)
    .where(ilike(courses.name, `%${term}%`))
    .offset(offset)
    .limit(limit)
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

  return allComments.reduce((acc, comment) => acc + comment.rating, 0) / allComments.length
}

export const getTopCoursesByRating = async () => {
  const allComments = await db
    .select()
    .from(comments)
    .where(and(isNotNull(comments.rating), isNotNull(comments.courseId)))

  const commentByCourse: Record<string, (typeof comments.$inferSelect)[]> = {}

  for (const comment of allComments) {
    if (!comment.courseId) {
      continue
    }

    if (!commentByCourse[comment.courseId]) {
      commentByCourse[comment.courseId] = []
    }

    commentByCourse[comment.courseId].push(comment)
  }

  return Object.entries(commentByCourse)
    .map(([courseId, comments]) => {
      const rating = comments.reduce((acc, comment) => acc + comment.rating, 0) / comments.length

      return {
        courseId,
        rating,
      }
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
}
