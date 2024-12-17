import { test } from '@japa/runner'

import { CreateUserDTO } from '#models/users/dto'
import { createUser, deleteUser } from '#models/users/repository'

test.group('Auth Login', (group) => {
  const user = {
    name: 'John',
    lastname: 'Doe',
    email: 'login.user@example.com',
    password: 'password123',
    age: 28,
    role: 'USER',
  } as CreateUserDTO

  group.setup(async () => {
    // First, delete the user if it exists
    await deleteUser(user.email)
    // Create user account to login
    await createUser(user)
  })

  test('should login successfully with valid credentials', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: user.email, password: 'password123' })

    response.assertStatus(200)
    response.assert?.isString(response.body().accessToken)
  })

  test('should fail login with incorrect password', async ({ client }) => {
    const response = await client
      .post('/api/auth/login')
      .json({ email: user.email, password: 'wrongpassword' })

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
    const response = await client.post('/api/auth/login').json({ email: user.email })

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
