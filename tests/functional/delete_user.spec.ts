import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import UserService from '#services/users_service'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'

test.group('Delete users', (group) => {
  // users data
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
    userToken = genUserAuthToken({ userId: userRecord?.userId, email: user.email, role: user.role })
    adminToken = genUserAuthToken({
      userId: adminUserRecord?.userId,
      email: adminUser.email,
      role: adminUser.role,
    })

    userEmail = user.email
    adminEmail = adminUser.email
  })

  test('Should allow ADMIN to delete a user', async ({ client }) => {
    const response = await client
      .delete(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    response.assertTextIncludes('User deleted successfully')
  })

  test('Should return 403 when an ADMIN tries to delete himself', async ({ client }) => {
    const response = await client
      .delete(`/api/users/${adminEmail}`)
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(403)
    response.assertTextIncludes('Forbidden action')
  })

  test('Should return 403 when a USER tries to delete a user', async ({ client }) => {
    const response = await client
      .delete(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${userToken}`)

    response.assertStatus(403)
    response.assertTextIncludes('Forbidden action')
  })

  test('SHould return 401 when the user is not authenticated', async ({ client }) => {
    const response = await client.delete(`/api/users/${userEmail}`)

    response.assertStatus(401)
    response.assertTextIncludes('Authentication required')
  })
})
