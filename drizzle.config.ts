import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env
const MYSQL_DATABASE_URL = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`

export default defineConfig({
  out: './drizzle',
  schema: './app/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: MYSQL_DATABASE_URL,
  },
})
