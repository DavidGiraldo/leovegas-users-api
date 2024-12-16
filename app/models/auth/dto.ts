export interface AuthAccessTokenDTO {
  authTokenId: number
  type: string
  hash: string
  aliveBy: string
  createdAt: Date
  updatedAt: Date
  lastUsedAt?: Date
  expiresAt: Date
}
