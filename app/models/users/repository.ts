import { eq } from 'drizzle-orm'

import { inject } from '@adonisjs/core'

import { user } from '#app/db/schema'
import setMySQLConn from '#config/database'
import AuthRepository from '#models/auth/repository'
import type { CreateUserDTO, UpdateUserDTO } from '#models/users/dto'
import UserRepositoryInterface from '#app/interfaces/user_repository_interface'

// Initialize dbClient
const initConn = setMySQLConn()
const dbClient = await initConn

@inject()
export default class UserRepository implements UserRepositoryInterface {
  constructor(protected authRepository: AuthRepository) {}

  // Create a new user
  public async createUser(data: CreateUserDTO): Promise<void> {
    await dbClient.insert(user).values(data)
  }

  // Get a user by email
  public async getUserByEmail(email: string): Promise<CreateUserDTO | undefined> {
    const [result] = await dbClient.select().from(user).where(eq(user.email, email))

    return result as CreateUserDTO
  }

  // Update a user by email
  public async updateUser(email: string, data: UpdateUserDTO): Promise<void> {
    await dbClient.update(user).set(data).where(eq(user.email, email))
  }

  // Delete a user by email
  public async deleteUser(email: string): Promise<void> {
    const [userRecord] = await dbClient.select().from(user).where(eq(user.email, email))

    if (userRecord) {
      await this.authRepository.deleteUserToken(userRecord.userId)
      await dbClient.delete(user).where(eq(user.email, email))
    }
  }

  // List users with pagination
  public async listUsers(page: number, pageSize: number): Promise<CreateUserDTO[] | undefined> {
    const offset = (page - 1) * pageSize

    const usersList = await dbClient.select().from(user).limit(pageSize).offset(offset)

    return usersList as CreateUserDTO[]
  }
}
