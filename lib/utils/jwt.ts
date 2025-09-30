import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  phone: string
  exp?: number
}

export async function signJWT(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  return jwt
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    if (payload && typeof payload === 'object' && 'userId' in payload && 'phone' in payload) {
      return payload as unknown as JWTPayload
    }
    return null
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export async function getUserIdFromRequest(authHeader: string | null): Promise<string | null> {
  const token = extractTokenFromHeader(authHeader)
  if (!token) return null

  const payload = await verifyJWT(token)
  return payload?.userId || null
}