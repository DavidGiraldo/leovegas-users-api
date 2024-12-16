import bcrypt from 'bcrypt'

import { logger } from '#config/logger'
import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import { UserSession } from '#app/interfaces/user_session'
import { getUserByEmail } from '#app/models/users/repository'
import { upsertUserToken } from '#app/models/auth/repository'

export default class AuthService {
  public async login(email: string, password: string) {
    try {
      // Get the user by email
      const user = (await getUserByEmail(email)) as CreateUserDTO

      // Compare the password
      const isPasswordMatch = await bcrypt.compare(password, user.password)
      if (!isPasswordMatch) {
        const error = new Error('Invalid credentials')
        Object.assign(error, { code: 'E_INVALID_CREDENTIALS' })

        throw error
      }

      // Generate an access token with payload
      const accessToken = genUserAuthToken({
        userId: user.userId,
        email: user.email,
        role: user.role,
      } as UserSession)

      // Upsert the user access token to the database
      await upsertUserToken(user, accessToken)

      logger.info(`${AuthService.name} - User access token generated successfully`)

      return accessToken
    } catch (error) {
      logger.error(`${AuthService.name} - Error: ${error.message}`)

      throw error
    }
  }
}
