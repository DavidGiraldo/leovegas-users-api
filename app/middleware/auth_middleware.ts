import jwt from 'jsonwebtoken'

import { HttpContext } from '@adonisjs/core/http'

import env from '#start/env'
import { logger } from '#config/logger'

const AUTHORIZATION_REQUIRED = 'Authentication required'
const INVALID_OR_EXPIRED_TOKEN = 'Invalid or expired token'

export default class AuthMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, response } = ctx
    const token = request.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return response.unauthorized(AUTHORIZATION_REQUIRED)
    }

    try {
      const decodedPayload = jwt.verify(token, env.get('APP_KEY'))
      ctx.params.userSession = decodedPayload

      await next()
    } catch {
      logger.error(`${AuthMiddleware.name} - ${INVALID_OR_EXPIRED_TOKEN}`)

      return response.unauthorized(INVALID_OR_EXPIRED_TOKEN)
    }
  }
}
