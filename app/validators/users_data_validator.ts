import vine from '@vinejs/vine'

import { ROLES } from '#app/constants/constants'

export const canTryCreateUser = vine.compile(
  vine.object({
    name: vine.string().trim(),
    lastname: vine.string().trim().optional(),
    email: vine.string().email().normalizeEmail().trim(),
    password: vine.string().minLength(6),
    age: vine.number().min(1).max(100).optional(),
    role: vine.enum(ROLES),
  })
)

export const canTryUpdateUser = vine.compile(
  vine.object({
    name: vine.string().trim().optional(),
    lastname: vine.string().trim().optional(),
    email: vine.string().email().normalizeEmail().trim().optional(),
    password: vine.string().minLength(6).optional(),
    age: vine.number().min(1).max(100).optional(),
    role: vine.enum(ROLES).optional(),
  })
)

export const canTryLogin = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().trim(),
    password: vine.string().minLength(6),
  })
)

export const isValidEmail = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail().trim(),
  })
)
