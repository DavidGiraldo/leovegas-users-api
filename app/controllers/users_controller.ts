import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

import { logger } from '#config/logger'
import UserService from '#services/users_service'
import { CreateUserDTO } from '#models/users/dto'
import HttpExceptionHandler from '#exceptions/handler'
import { getEmailParamValidated } from '#utils/helpers'
import { E_USER_NOT_FOUND } from '#app/exceptions/handler'
import { canTryCreateUser, canTryUpdateUser } from '#validators/users_data_validator'

@inject()
export default class UsersController extends HttpExceptionHandler {
  constructor(protected userService: UserService) {
    super()
  }

  public async create({ request, response }: HttpContext) {
    try {
      const data = request.all()
      const userData = (await canTryCreateUser.validate(data)) as CreateUserDTO

      await this.userService.create(userData)
      logger.info(`${UsersController.name} - User created successfully`)

      return response.status(201).json({ message: 'User created successfully' })
    } catch (error) {
      return this.handleCustomErrors(error, UsersController.name, response)
    }
  }

  public async showByEmail({ params, response }: HttpContext) {
    try {
      const email = await getEmailParamValidated(params)

      const user = await this.userService.show(email)

      if (!user) {
        const error = new Error('User not found')
        Object.assign(error, { code: E_USER_NOT_FOUND })

        throw error
      }

      logger.info(`${UsersController.name} - User found successfully`)

      return response.status(200).json(user)
    } catch (error) {
      return this.handleCustomErrors(error, UsersController.name, response)
    }
  }

  public async listPaginated({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const pageSize = request.input('pageSize', 10)

      const users = await this.userService.index(page, pageSize)

      logger.info(`${UsersController.name} - Users listed successfully`)

      return response.status(200).json(users)
    } catch (error) {
      return this.handleCustomErrors(error, UsersController.name, response)
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const email = await getEmailParamValidated(params)

      const data = request.all()
      const userData = await canTryUpdateUser.validate(data)

      await this.userService.update(email, userData)

      logger.info(`${UsersController.name} - User updated successfully`)

      return response.status(200).json({ message: 'User updated successfully' })
    } catch (error) {
      return this.handleCustomErrors(error, UsersController.name, response)
    }
  }

  public async delete({ params, response }: HttpContext) {
    try {
      const email = await getEmailParamValidated(params)

      await this.userService.destroy(email)

      logger.info(`${UsersController.name} - User deleted successfully`)

      return response.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      return this.handleCustomErrors(error, UsersController.name, response)
    }
  }
}
