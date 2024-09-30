import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const professors = pgTable('professors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email'),
  profileImg: text('profile_img'),
})

export const courses = pgTable('courses', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  code: integer('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
})

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  providerId: text('provider_id').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  profileImg: text('profile_img'),
})

export const coursesProfessors = pgTable('courses_professors', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: text('course_id').references(() => courses.id),
  professorId: text('professor_id').references(() => professors.id),
  year: integer('year').notNull(),
  period: integer('period').notNull(),
})

export const comments = pgTable('comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  courseId: text('course_id').references(() => courses.id),
  professorId: text('professor_id').references(() => professors.id),
})
