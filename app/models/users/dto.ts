export interface CreateUserDTO {
  userId: number
  name: string
  lastname: string
  email: string
  password: string
  age: number
  role: string
}

export interface UpdateUserDTO {
  userId?: number
  name?: string
  lastname?: string
  email?: string
  password?: string
  age?: number
  role?: string
}

export interface LogedUserDTO {
  userId: number
  name: string
  lastname: string
  email: string
  age: number
  role: string
}
