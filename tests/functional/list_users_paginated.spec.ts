import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import { deleteUser, createUser, getUserByEmail } from '#models/users/repository'

test.group('Users list paginated', (group) => {
  // User data
  let userToken: string
  let adminToken: string

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

  group.setup(async () => {
    // First, delete the users if they exist
    await deleteUser(user.email)
    await deleteUser(adminUser.email)

    // Create users accounts
    await createUser(user)
    await createUser(adminUser)

    // Find the users
    const { userId } = (await getUserByEmail(user.email)) as CreateUserDTO
    const { userId: adminUserId } = (await getUserByEmail(adminUser.email)) as CreateUserDTO

    // Assign the user IDs
    Object.assign(user, { userId })
    Object.assign(adminUser, { userId: adminUserId })

    // Generate authentication tokens
    userToken = genUserAuthToken({ userId, email: user.email, role: user.role })
    adminToken = genUserAuthToken({
      userId: adminUserId,
      email: adminUser.email,
      role: adminUser.role,
    })
  })

  test('should allow ADMIN to retrieve paginated user list', async ({ client }) => {
    const response = await client.get('/api/users').header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    response.assert?.isArray(response.body())
  })

  test('should return 403 when authenticated as USER', async ({ client }) => {
    const response = await client.get('/api/users').header('Authorization', `Bearer ${userToken}`)

    response.assertStatus(403)
    response.assertTextIncludes('Forbidden action')
  })

  test('should return 401 when not authenticated', async ({ client }) => {
    const response = await client.get('/api/users')

    response.assertStatus(401)
    response.assertTextIncludes('Authentication required')
  })

  test('should support pagination parameters', async ({ client }) => {
    const response = await client
      .get('/api/users?page=1&pageSize=5')
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    response.assert?.isArray(response.body())
  })
})
