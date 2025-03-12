import { count, eq, ilike } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { professors } from '../../db/schema.js'
import type { ReqQueryParams } from '../types.js'

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
