import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import UserService from '#services/users_service'
import AuthRepository from '#models/auth/repository'
import UserRepository from '#models/users/repository'
import PasswordEncryption from '#services/password_encription'

test.group('Users retrieve', (group) => {
  // User data
  let userToken: string
  let userEmail: string
  // Admin user data
  let adminToken: string
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
    name: 'John',
    lastname: 'Doe',
    email: 'admin@example.com',
    password: 'password123',
    age: 29,
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

    // Sign the users tokens
    userToken = genUserAuthToken({ userId: userRecord?.userId, email: user.email, role: user.role })
    adminToken = genUserAuthToken({
      userId: adminUserRecord?.userId,
      email: adminUser.email,
      role: adminUser.role,
    })

    userEmail = user.email
    adminEmail = adminUser.email
  })

  test('should retrieve own user info when authenticated as USER', async ({ client }) => {
    const response = await client
      .get(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${userToken}`)

    response.assertStatus(200)
    response.assertBodyContains({ email: userEmail })
  })

  test("should return 403 when USER tries to access another user's info", async ({ client }) => {
    const response = await client
      .get(`/api/users/${adminEmail}`)
      .header('Authorization', `Bearer ${userToken}`)

    response.assertStatus(403)
    response.assertTextIncludes('Forbidden action')
  })

  test('should allow ADMIN to access any user info', async ({ client }) => {
    const response = await client
      .get(`/api/users/${userEmail}`)
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    response.assertBodyContains({ email: userEmail })
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const response = await client.get(`/api/users/${userEmail}`)

    response.assertStatus(401)
    response.assertTextIncludes('Authentication required')
  })
})
