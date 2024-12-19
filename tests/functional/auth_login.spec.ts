import { test } from '@japa/runner'

import { CreateUserDTO } from '#models/users/dto'
import UserService from '#services/users_service'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'

test.group('Auth Login', (group) => {
  const user = {
    name: 'John',
    lastname: 'Doe',
    email: 'login.user@example.com',
    password: 'password123',
    age: 28,
    role: 'USER',
  } as CreateUserDTO

  let userEmail: string = user.email
  let userPassword: string = user.password

  const authRepository = new AuthRepository()
  const userRepository = new UserRepository(authRepository)
  const passwordEncryption = new PasswordEncryption()
  const userService = new UserService(userRepository, passwordEncryption)

  group.setup(async () => {
    // First, delete the user if it exists
    await userService.destroy(userEmail)
    // Create user account to login
    await userService.create(user)
  })

  test('should login successfully with valid credentials', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: userEmail, password: userPassword })

    response.assertStatus(200)
    response.assert?.isString(response.body().accessToken)
  })

  test('should fail login with incorrect password', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: userEmail, password: 'wrongpassword' })

    response.assertStatus(401)
    response.assertTextIncludes('Invalid credentials')
  })

  test('should fail login with non-existent email', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: 'nonexistent@example.com', password: 'password123' })

    response.assertStatus(401)
    response.assertTextIncludes('Invalid credentials')
  })

  test('should return validation errors when fields are missing', async ({ client }) => {
    const response = await client.post('/api/auth/login').json({ email: userEmail })

    response.assertStatus(422)
    response.assert?.isArray(response.body())
  })

  test('should return validation errors when email is invalid', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: 'invalid-email', password: 'password123' })

    response.assertStatus(422)
    response.assert?.isArray(response.body())
  })
})
