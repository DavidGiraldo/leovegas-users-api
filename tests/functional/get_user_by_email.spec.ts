import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import { deleteUser, createUser, getUserByEmail } from '#models/users/repository'

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

  group.setup(async () => {
    // First, delete the users if they exist
    await deleteUser(user.email)
    await deleteUser(adminUser.email)

    // Create users accounts
    await createUser(user)
    await createUser(adminUser)

    // Find the users
    const { userId } = (await getUserByEmail(user.email)) as CreateUserDTO
    const { userId: userAdminId } = (await getUserByEmail(adminUser.email)) as CreateUserDTO

    // Assing each userId to each user
    Object.assign(user, { userId })
    Object.assign(adminUser, { userId: userAdminId })

    // Sign the users tokens
    userToken = genUserAuthToken({ userId, email: user.email, role: user.role })
    adminToken = genUserAuthToken({
      userId: userAdminId,
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
