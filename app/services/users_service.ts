import bcrypt from 'bcrypt'

import {
  createUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  listUsers,
} from '#app/models/users/repository'
import { logger } from '#config/logger'
import type { CreateUserDTO, UpdateUserDTO } from '#app/models/users/dto'

export default class UserService {
  public async create(data: CreateUserDTO) {
    try {
      // Hash the password before saving
      data.password = await bcrypt.hash(data.password, 10)
      await createUser(data)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async show(email: string) {
    try {
      return await getUserByEmail(email)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async index(page: number, pageSize: number) {
    try {
      return await listUsers(page, pageSize)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async update(email: string, data: UpdateUserDTO) {
    try {
      // Hash the password if it's being updated
      if (data.password) {
        const existingUser = await getUserByEmail(email)
        if (!existingUser) {
          throw new Error('User not found')
        }

        // Check if new password is the same as the existing password
        const isSamePassword = await bcrypt.compare(data.password, existingUser.password)
        if (isSamePassword) {
          const error = new Error('New password cannot be the same as the current password')
          Object.assign(error, { code: 'E_SAME_PASSWORD' })

          throw error
        }

        data.password = await bcrypt.hash(data.password, 10)
      }
      await updateUser(email, data)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async destroy(email: string) {
    try {
      await deleteUser(email)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }
}
