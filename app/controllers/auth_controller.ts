import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { logger } from '#config/logger'
import AuthService from '#services/auth_service'
import HttpExceptionHandler from '#exceptions/handler'
import { canTryLogin } from '#validators/users_data_validator'

@inject()
export default class AuthController extends HttpExceptionHandler {
  constructor(protected authService: AuthService) {
    super()
  }

  public async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await canTryLogin.validate(request.all())

      const accessToken = await this.authService.login(email, password)

      logger.info(`${AuthController.name} - User logged in successfully`)

      return response.status(200).json({ accessToken })
    } catch (error) {
      return this.handleCustomErrors(error, AuthController.name, response)
    }
  }
}
