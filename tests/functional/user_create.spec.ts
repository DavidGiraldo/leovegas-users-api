import { test } from '@japa/runner'

import { CreateUserDTO } from '#models/users/dto'
import UserService from '#services/users_service'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'

test.group('Users create', () => {
  const authRepository = new AuthRepository()
  const userRepository = new UserRepository(authRepository)
  const passwordEncryption = new PasswordEncryption()
  const userService = new UserService(userRepository, passwordEncryption)

  test('should create a new user successfully', async ({ client }) => {
    const email = `johndoe${Math.floor(Math.random() * 1000)}@example.com`

    // Delete the user if it exists
    await userService.destroy(email)

    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email,
      password: 'password789',
      age: 28,
      role: 'USER',
    })

    response.assertStatus(201)
    response.assertBodyContains({ message: 'User created successfully' })
  })

  test('should return validation error when required fields are missing', async ({ client }) => {
    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: 'incomplete@example.com',
      password: 'password789',
      age: 28,
    })

    response.assertStatus(422)
    response.assertBodyContains([
      { message: 'The role field must be defined', rule: 'required', field: 'role' },
    ])
  })

  test('should not create a user with existing email', async ({ client }) => {
    const EMAIL_TEST = 'duplicate@example.com'

    // Delete the user if it exists
    await userService.destroy(EMAIL_TEST)

    // Create a user first
    await userService.create({
      name: 'John',
      lastname: 'Doe',
      email: EMAIL_TEST,
      password: 'password789',
      age: 28,
      role: 'USER',
    } as CreateUserDTO)

    // Try creating the user again
    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: EMAIL_TEST,
      password: 'Password123!',
      age: 28,
      role: 'USER',
    })

    response.assertStatus(409)
    response.assertBodyContains({
      message: `Duplicate entry '${EMAIL_TEST}' for key 'users.users_email_unique'`,
    })
  })

  test('should return error for invalid email format', async ({ client }) => {
    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: 'invalid-email',
      password: 'Password123!',
      age: 28,
      role: 'USER',
    })

    response.assertStatus(422)
    response.assertBodyContains([
      {
        message: 'The email field must be a valid email address',
        rule: 'email',
        field: 'email',
      },
    ])
  })
})
