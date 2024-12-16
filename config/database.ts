import env from '#start/env'

import { logger } from '#config/logger'

import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

// Singleton instance holder
let dbClientInstance: ReturnType<typeof drizzle> | null = null

function getDBConfigProps() {
  const DB_HOST = env.get('DB_HOST')
  const DB_USER = env.get('DB_USER')
  const DB_PASSWORD = env.get('DB_PASSWORD')
  const DB_DATABASE = env.get('DB_DATABASE')

  if (!DB_HOST) {
    throw new Error('DB_HOST is not defined')
  }

  if (!DB_USER) {
    throw new Error('DB_USER is not defined')
  }

  if (!DB_DATABASE) {
    throw new Error('DB_DATABASE is not defined')
  }

  if (!DB_PASSWORD) {
    throw new Error('DB_PASSWORD is not defined')
  }

  return {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  }
}

export async function setMySQLConn() {
  if (dbClientInstance) {
    // Return the existing instance
    return dbClientInstance
  }

  const connection = await mysql.createConnection(getDBConfigProps())
  dbClientInstance = drizzle(connection)
  logger.info('Database connection established')

  return dbClientInstance
}
