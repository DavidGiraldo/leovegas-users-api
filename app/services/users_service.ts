import { inject } from '@adonisjs/core'

import { logger } from '#config/logger'
import UserRepository from '#models/users/repository'
import { E_SAME_PASSWORD } from '#app/exceptions/handler'
import PasswordEncryption from '#services/password_encription'
import type { CreateUserDTO, UpdateUserDTO } from '#app/models/users/dto'

@inject()
export default class UserService {
  constructor(
    protected userRepository: UserRepository,
    protected passwordEncryption: PasswordEncryption
  ) {}

  public async create(data: CreateUserDTO) {
    try {
      // Hash the password before saving
      data.password = await this.passwordEncryption.encrypt(data.password, 10)

      await this.userRepository.createUser(data)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async show(email: string) {
    try {
      return await this.userRepository.getUserByEmail(email)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async index(page: number, pageSize: number) {
    try {
      return await this.userRepository.listUsers(page, pageSize)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async update(email: string, data: UpdateUserDTO) {
    try {
      // Hash the password if it's being updated
      if (data.password) {
        const existingUser = await this.userRepository.getUserByEmail(email)
        if (!existingUser) {
          throw new Error('User not found')
        }

        // Check if new password is the same as the existing password
        const isSamePassword = await this.passwordEncryption.compare(
          data.password,
          existingUser.password
        )
        if (isSamePassword) {
          const error = new Error('New password cannot be the same as the current password')
          Object.assign(error, { code: E_SAME_PASSWORD })

          throw error
        }

        data.password = await this.passwordEncryption.encrypt(data.password, 10)
      }
      await this.userRepository.updateUser(email, data)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }

  public async destroy(email: string) {
    try {
      await this.userRepository.deleteUser(email)
    } catch (error) {
      logger.error(`${UserService.name} - Error: ${error.message}`)

      throw error
    }
  }
}
