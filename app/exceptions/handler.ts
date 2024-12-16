import { errors } from '@vinejs/vine'
import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

import { logger } from '#config/logger'

const ER_DUP_ENTRY = 'ER_DUP_ENTRY'
const E_SAME_PASSWORD = 'E_SAME_PASSWORD'
const E_INVALID_CREDENTIALS = 'E_INVALID_CREDENTIALS'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    return super.handle(error, ctx)
  }

  async handleCustomErrors(error: any, artifact: string, response: HttpContext['response']) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      logger.error(`${artifact} - Error: ${error.message}`)

      return response.status(422).send(error.messages)
    }

    if (error?.sql && error?.code === ER_DUP_ENTRY) {
      logger.error(`${artifact} - ${error.stack}`)

      return response.status(409).json({ message: error.sqlMessage })
    }

    if (error?.code === E_SAME_PASSWORD) {
      logger.error(`${artifact} - Error: ${error.message}`)

      return response.status(400).json({ message: error.message })
    }

    if (error?.code === E_INVALID_CREDENTIALS) {
      logger.error(`${artifact} - Error: ${error.message}`)

      return response.status(400).json({ message: error.message })
    }

    if (error?.sql && error?.code !== ER_DUP_ENTRY) {
      logger.error(`${artifact} - ${error.stack}`)

      return response.status(500).json({ message: error.sqlMessage })
    }

    logger.error(`${artifact} - Error: ${error.stack}`)

    return response.status(500).json({ message: error.message })
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
