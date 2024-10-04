import { client, db } from './index.js'
import * as schema from './schema.js'

async function seed() {
  await db.delete(schema.comments)
  await db.delete(schema.coursesProfessors)
  await db.delete(schema.users)
  await db.delete(schema.courses)
  await db.delete(schema.professors)

  const professors = await db
    .insert(schema.professors)
    .values({
      name: 'Test Professor',
      email: 'professor@test.com',
      profileImg: null,
    })
    .returning()

  const courses = await db
    .insert(schema.courses)
    .values({
      code: 101,
      name: 'Test Course',
      description: 'This is a test course.',
    })
    .returning()

  db.insert(schema.users).values({
    providerId: 'test',
    email: 'user.email@test.com',
    name: 'john doe',
    profileImg: null,
  })

  db.insert(schema.coursesProfessors).values({
    period: 2,
    courseId: courses[0].id,
    year: 2020,
    professorId: professors[0].id,
  })
}

seed().finally(async () => {
  await client.end()
})
