import { test } from '@japa/runner'

import { genUserAuthToken } from '#config/auth'
import { CreateUserDTO } from '#models/users/dto'
import { deleteUser, createUser, getUserByEmail } from '#models/users/repository'

test.group('Delete users', (group) => {
  // Datos de usuario
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
