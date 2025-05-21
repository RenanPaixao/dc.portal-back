import { eq } from 'drizzle-orm'
import type { ScrappedProfessorCourse } from '../scrap/professorCourse.js'
import allCourses from '../scrap/results/courses.json'
import professorCourses from '../scrap/results/professorCourses.json'
import allProfessors from '../scrap/results/professors.json'
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

async function fillProfessors() {
  for (const professor of allProfessors) {
    await db.insert(schema.professors).values({
      name: professor.name,
      email: professor.email,
      profileImg: professor.profileImg,
    })
  }
}

async function fillCoursesProfessors() {
  for (const [name, value] of Object.entries(professorCourses)) {
    const taughtCourses = value as unknown as ScrappedProfessorCourse[string]
    try {
      const professor = await db.select().from(schema.professors).where(eq(schema.professors.name, name))

      if (professor.length !== 1) {
        console.log(professor)
        console.error(`No professors or duplicated ones are found for ${name}`)
        break
      }

      const professorId = professor[0].id

      for (const course of taughtCourses) {
        const courseRow = await db.select().from(schema.courses).where(eq(schema.courses.code, course.courseCode))

        if (courseRow.length !== 1) {
          console.error(`No courses or duplicated ones are found for ${course.courseCode}`)
          continue
        }

        const courseId = courseRow[0].id

        await db.insert(schema.coursesProfessors).values({
          courseId,
          professorId,
          year: course.year,
        })
      }
    } catch (e) {
      console.error('Error trying to get professor by name', e)
    }
  }
}

// TODO: Make it an upsert
Promise.all([fillCourses(), fillProfessors()])
  .then(async () => {
    await fillCoursesProfessors()
  })
  .finally(async () => {
    await client.end()
    process.exit(0)
  })
