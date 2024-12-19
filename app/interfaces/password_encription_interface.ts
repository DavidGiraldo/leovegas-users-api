export default interface PasswordEncryptionInterface {
  encrypt(rawPassword: string | Buffer, saltOrRounds: string | number): Promise<string>
  compare(rawPassword: string | Buffer, encrypted: string): Promise<boolean>
}
