import { HttpContext } from '@adonisjs/core/http'

import { logger } from '#config/logger'
import { USER, ADMIN } from '#app/constants/constants'

const FORBIDDEN_ACTION = 'Forbidden action'
const UNAUTHORIZED_ACTION = 'Insufficient permissions - Unauthorized action'

export default class RoleOpsValidatorMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const {
      request,
      response,
      params: { userSession, email },
    } = ctx

    try {
      if (request.method() === 'GET' || request.method() === 'PUT') {
        if (userSession.role === USER && userSession.email !== email) {
          logger.error(`${RoleOpsValidatorMiddleware.name} - ${UNAUTHORIZED_ACTION}`)

          return response.forbidden(FORBIDDEN_ACTION)
        } else {
          await next()
        }

        if (userSession.role === ADMIN) {
          await next()
        }
      }

      if (request.method() === 'DELETE') {
        if (userSession.role === USER) {
          logger.error(`${RoleOpsValidatorMiddleware.name} -  ${UNAUTHORIZED_ACTION}`)

          return response.forbidden(FORBIDDEN_ACTION)
        }

        if (userSession.role === ADMIN && userSession.email !== email) {
          await next()
        } else {
          logger.error(`${RoleOpsValidatorMiddleware.name} - ADMIN users can't delete themselves`)

          return response.forbidden(FORBIDDEN_ACTION)
        }
      }
    } catch (error) {
      return response.internalServerError(error.message)
    }
  }
}
