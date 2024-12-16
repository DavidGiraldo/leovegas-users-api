import { eq } from 'drizzle-orm'

import { user } from '#app/db/schema'
import { setMySQLConn } from '#config/database'
import type { CreateUserDTO, UpdateUserDTO } from '#models/users/dto'
import { deleteUserToken } from '#models/auth/repository'

// Initialize dbClient
const initConn = setMySQLConn()
const dbClient = await initConn

// Create a new user
export async function createUser(data: CreateUserDTO): Promise<void> {
  await dbClient.insert(user).values(data)
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<CreateUserDTO | undefined> {
  const [result] = await dbClient.select().from(user).where(eq(user.email, email))

  return result as CreateUserDTO
}

// Update a user by email
export async function updateUser(email: string, data: UpdateUserDTO): Promise<void> {
  await dbClient.update(user).set(data).where(eq(user.email, email))
}

// Delete a user by email
export async function deleteUser(email: string): Promise<void> {
  // Get the user record to obtain userId
  const [userRecord] = await dbClient.select().from(user).where(eq(user.email, email))

  if (userRecord) {
    // Delete the user's auth token
    await deleteUserToken(userRecord.userId)
    // Delete the user
    await dbClient.delete(user).where(eq(user.email, email))
  }
}

// List users with pagination
export async function listUsers(
  page: number,
  pageSize: number
): Promise<CreateUserDTO[] | undefined> {
  const offset = (page - 1) * pageSize
  const usersList = await dbClient.select().from(user).limit(pageSize).offset(offset)

  return usersList as CreateUserDTO[]
}
