import { LogedUserDTO } from '#models/users/dto'

export interface AuthRepositoryInterface {
  upsertUserToken(user: LogedUserDTO, accessTokenHash: string): Promise<void>
  updateUserTokenLastUsedAt(userId: number): Promise<void>
  deleteUserToken(authTokenId: number): Promise<void>
}
