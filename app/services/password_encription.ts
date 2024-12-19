import bcrypt from 'bcrypt'

import { inject } from '@adonisjs/core'

import PasswordEncryptionInterface from '#app/interfaces/password_encription_interface'

@inject()
export default class PasswordEncryption implements PasswordEncryptionInterface {
  public async encrypt(
    rawPassword: string | Buffer,
    saltOrRounds: string | number
  ): Promise<string> {
    return await bcrypt.hash(rawPassword, saltOrRounds)
  }

  public async compare(rawPassword: string | Buffer, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(rawPassword, encrypted)
  }
}
