import { count, eq, ilike } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { courses, coursesProfessors, professors } from '../../db/schema.js'
import type { ReqQueryParams } from '../types.js'
import camelcaseKeys from 'camelcase-keys'

export const getAllProfessors = async (options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db.select().from(professors).offset(offset).limit(limit)
}

export const getProfessorsCount = async () => {
  return db.select({ count: count() }).from(professors)
}

export const searchByProfessors = async (term: string, options?: ReqQueryParams) => {
  const { offset = 0, limit = Number.MAX_SAFE_INTEGER } = options ?? {}

  return db
    .select()
    .from(professors)
    .where(ilike(professors.name, `%${term}%`))
    .offset(offset)
    .limit(limit)
}

export const getProfessorById = async (id: string) => {
  return db
    .select()
    .from(professors)
    .where(eq(professors.id, id))
    .then(res => res[0])
}

export const getProfessorCourses = async (id: string) => {
  const result = await db
    .select()
    .from(coursesProfessors)
    .innerJoin(courses, eq(coursesProfessors.courseId, courses.id))
    .where(eq(coursesProfessors.professorId, id))
  
  return camelcaseKeys(result, {deep: true})
}
