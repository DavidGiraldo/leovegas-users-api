import { inject } from '@adonisjs/core'

import { logger } from '#config/logger'
import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'
import { E_INVALID_CREDENTIALS } from '#app/exceptions/handler'
import { UserSessionInterface } from '#app/interfaces/user_session_interface'
import { AuthServiceInterface } from '#app/interfaces/auth_service_interface'

@inject()
export default class AuthService implements AuthServiceInterface {
  constructor(
    protected userRepository: UserRepository,
    protected authRepository: AuthRepository,
    protected passwordEncryption: PasswordEncryption
  ) {}

  public async login(email: string, password: string): Promise<string> {
    try {
      // Get the user by email
      const user = (await this.userRepository.getUserByEmail(email)) as CreateUserDTO

      if (!user) {
        const error = new Error('Invalid credentials')
        Object.assign(error, { code: E_INVALID_CREDENTIALS })

        throw error
      }

      // Compare the password
      const isPasswordMatch = await this.passwordEncryption.compare(password, user.password)
      if (!isPasswordMatch) {
        const error = new Error('Invalid credentials')
        Object.assign(error, { code: E_INVALID_CREDENTIALS })

        throw error
      }

      // Generate an access token with payload
      const accessToken = genUserAuthToken({
        userId: user.userId,
        email: user.email,
        role: user.role,
      } as UserSessionInterface)

      // Upsert the user access token to the database
      await this.authRepository.upsertUserToken(user, accessToken)

      logger.info(`${AuthService.name} - User access token generated successfully`)

      return accessToken
    } catch (error) {
      logger.error(`${AuthService.name} - Error: ${error.message}`)

      throw error
    }
  }
}
