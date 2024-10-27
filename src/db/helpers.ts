import { db } from './index.js'
import * as schema from './schema.js'

export async function clearDB() {
  await db.delete(schema.comments)
  await db.delete(schema.coursesProfessors)
  await db.delete(schema.users)
  await db.delete(schema.courses)
  await db.delete(schema.professors)
}
