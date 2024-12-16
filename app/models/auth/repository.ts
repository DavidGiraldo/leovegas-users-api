import { eq, sql } from 'drizzle-orm'

import { setMySQLConn } from '#config/database'
import { authAccessToken } from '#app/db/schema'
import { LogedUserDTO } from '#app/models/users/dto'
import { calculateExpiresAt, formatDateToYYYYMMDDHHMMSS } from '#app/utils/helpers'

const CURRENT_TIMESTAMP = sql`CURRENT_TIMESTAMP`

// Initialize dbClient
const initConn = setMySQLConn()
const dbClient = await initConn

// Upsert a user token
export async function upsertUserToken(user: LogedUserDTO, accessTokenHash: string): Promise<void> {
  const expiresAt = calculateExpiresAt()
  const aliveBy = formatDateToYYYYMMDDHHMMSS(expiresAt)

  await dbClient
    .insert(authAccessToken)
    .values({
      authTokenId: user.userId,
      type: 'jwt',
      hash: accessTokenHash,
      aliveBy,
      lastUsedAt: CURRENT_TIMESTAMP,
      expiresAt,
    })
    .onDuplicateKeyUpdate({
      set: {
        hash: accessTokenHash,
        aliveBy,
        updatedAt: CURRENT_TIMESTAMP,
        lastUsedAt: CURRENT_TIMESTAMP,
        expiresAt,
      },
    })
}

export async function updateUserTokenLastUsedAt(userId: number): Promise<void> {
  await dbClient
    .update(authAccessToken)
    .set({ lastUsedAt: CURRENT_TIMESTAMP })
    .where(eq(authAccessToken.authTokenId, userId))
}

export async function deleteUserToken(authTokenId: number): Promise<void> {
  await dbClient.delete(authAccessToken).where(eq(authAccessToken.authTokenId, authTokenId))
}
