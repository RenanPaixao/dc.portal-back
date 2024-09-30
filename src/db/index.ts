import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { env } from '../../env.js'
import * as schema from './schema.js'

export const client = new pg.Client({
  connectionString: env.DATABASE_URL,
})

await client.connect()

export const db = drizzle(client, { schema, logger: true })
