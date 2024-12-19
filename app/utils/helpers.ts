import env from '#start/env'
import { isValidEmail } from '#validators/users_data_validator'

const AUTH_TOKENS_TTL = env.get('AUTH_TOKENS_TTL') ?? '20m'

// Helper function to validate email param
export const getEmailParamValidated = async (requestData: Record<string, any>) => {
  // get the data type of emailToValidate
  const { email } = await isValidEmail.validate(requestData)

  return email
}

// Helper function to parse TTL string (e.g., '20m') to milliseconds
function parseTTL(ttl: string): number {
  const unit = ttl.slice(-1)
  const value = Number.parseInt(ttl.slice(0, -1), 10)

  switch (unit) {
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      throw new Error(`Invalid TTL unit in AUTH_TOKENS_TTL: ${ttl}`)
  }
}

// Helper function to calculate expiresAt
export function calculateExpiresAt(): Date {
  const ttlMs = parseTTL(AUTH_TOKENS_TTL)

  return new Date(Date.now() + ttlMs)
}

// Helper function to format aliveBy as 'YYYYMMDDHHMMSS'
export function formatDateToYYYYMMDDHHMMSS(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  )
}
