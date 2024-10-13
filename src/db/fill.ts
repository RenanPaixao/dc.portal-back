import allCourses from '../scrap/results/courses.json'
import { client, db } from './index.js'
import * as schema from './schema.js'

async function fillCourses() {
  for (const course of allCourses) {
    await db.insert(schema.courses).values({
      code: course.code,
      name: course.name,
      description: course.description,
      period: course.period,
    })
  }
}

Promise.all([fillCourses()]).finally(async () => {
  await client.end()
})
