import { test } from '@japa/runner'

import { deleteUser } from '#models/users/repository'

test.group('Users create', () => {
  test('should create a new user successfully', async ({ client }) => {
    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: `johndoe${Math.floor(Math.random() * 1000)}@example.com`,
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
    await deleteUser(EMAIL_TEST)

    // Create a user first
    await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: 'duplicate@example.com',
      password: 'password789',
      age: 28,
      role: 'USER',
    })

    // Try creating the user again
    const response = await client.post('/api/users/').json({
      name: 'John',
      lastname: 'Doe',
      email: 'duplicate@example.com',
      password: 'Password123!',
      age: 28,
      role: 'USER',
    })

    response.assertStatus(409)
    response.assertBodyContains({
      message: "Duplicate entry 'duplicate@example.com' for key 'users.users_email_unique'",
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
