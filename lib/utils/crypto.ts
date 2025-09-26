import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const algorithm = 'aes-256-gcm'
const key = process.env.PHONE_ENCRYPTION_KEY ?
  Buffer.from(process.env.PHONE_ENCRYPTION_KEY, 'hex') :
  Buffer.alloc(32) // Fallback for dev

export function hashPhone(phone: string): string {
  return createHash('sha256').update(phone).digest('hex')
}

export function encryptPhone(phone: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(phone, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decryptPhone(encryptedData: string): string {
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}