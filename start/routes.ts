/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

const UsersController = () => import('#app/controllers/users_controller')
const AuthController = () => import('#app/controllers/auth_controller')

router.get('api/health', async () => {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
})

router
  .group(() => {
    router.post('/', [UsersController, 'create'])
    router
      .get('/:email', [UsersController, 'showByEmail'])
      .use([middleware.authMiddleware(), middleware.roleOpsValidatorMiddleware()])
    router
      .get('/', [UsersController, 'listPaginated'])
      .use([middleware.authMiddleware(), middleware.roleOpsValidatorMiddleware()])
    router
      .put('/:email', [UsersController, 'update'])
      .use([middleware.authMiddleware(), middleware.roleOpsValidatorMiddleware()])
    router
      .delete('/:email', [UsersController, 'delete'])
      .use([middleware.authMiddleware(), middleware.roleOpsValidatorMiddleware()])
  })
  .prefix('api/users')

router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('api/auth')
