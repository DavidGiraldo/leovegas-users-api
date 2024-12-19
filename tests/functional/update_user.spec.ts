import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import UserService from '#services/users_service'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'

test.group('Users update', (group) => {
  // User data
  let userToken: string
  let adminToken: string
  let userEmail: string
  let adminEmail: string

  const user = {
    name: 'John',
    lastname: 'Doe',
    email: 'user@example.com',
    password: 'password123',
    age: 28,
    role: 'USER',
  } as CreateUserDTO

  const adminUser = {
    name: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    password: 'password123',
    age: 35,
    role: 'ADMIN',
  } as CreateUserDTO

  const authRepository = new AuthRepository()
  const userRepository = new UserRepository(authRepository)
  const passwordEncryption = new PasswordEncryption()
  const userService = new UserService(userRepository, passwordEncryption)

  group.setup(async () => {
    // First, delete the users if they exist
    await userService.destroy(user.email)
    await userService.destroy(adminUser.email)

    // Create user accounts
    await userService.create(user)
    await userService.create(adminUser)

    // Find the users
    const userRecord = await userService.show(user.email)
    const adminUserRecord = await userService.show(adminUser.email)

    // Assign the user IDs
    Object.assign(user, { userId: userRecord?.userId })
    Object.assign(adminUser, { userId: adminUserRecord?.userId })

    // Generate authentication tokens
    userToken = genUserAuthToken({ userId: user.userId, email: user.email, role: user.role })
    adminToken = genUserAuthToken({
      userId: adminUser.userId,
      email: adminUser.email,
      role: adminUser.role,
    })

    userEmail = user.email
    adminEmail = adminUser.email
  })

  test('should allow USER to update own information', async ({ client }) => {
    const response = await client
      .put(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${userToken}`)
      .json({ name: 'John Updated' })

    response.assertStatus(200)
    response.assertTextIncludes('User updated successfully')
  })

  test('should return 403 when USER tries to update another user', async ({ client }) => {
    const response = await client
      .put(`/api/users/${adminEmail}`)
      .header('Authorization', `Bearer ${userToken}`)
      .json({ name: 'Should Not Allow' })

    response.assertStatus(403)
    response.assertTextIncludes('Forbidden action')
  })

  test('should allow ADMIN to update any user', async ({ client }) => {
    const response = await client
      .put(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${adminToken}`)
      .json({ name: 'Admin Updated User' })

    response.assertStatus(200)
    response.assertTextIncludes('User updated successfully')
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const response = await client.put(`/api/users/${userEmail}`).json({ name: 'Should Not Work' })

    response.assertStatus(401)
    response.assertTextIncludes('Authentication required')
  })

  test('should return validation errors for invalid data', async ({ client }) => {
    const response = await client
      .put(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${adminToken}`)
      .json({ email: 'invalid-email' })

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
