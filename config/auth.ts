import jwt from 'jsonwebtoken'

import env from '#start/env'

export const genUserAuthToken = (payload: Record<string, any>) => {
  return jwt.sign(payload, env.get('APP_KEY'), { expiresIn: env.get('AUTH_TOKENS_TTL') })
}
