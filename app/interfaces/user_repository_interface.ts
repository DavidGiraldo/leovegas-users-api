import { CreateUserDTO, UpdateUserDTO } from '#app/models/users/dto'

export default interface UserRepositoryInterface {
  createUser(data: CreateUserDTO): Promise<void>
  getUserByEmail(email: string): Promise<CreateUserDTO | undefined>
  updateUser(email: string, data: UpdateUserDTO): Promise<void>
  deleteUser(email: string): Promise<void>
  listUsers(page: number, pageSize: number): Promise<CreateUserDTO[] | undefined>
}
