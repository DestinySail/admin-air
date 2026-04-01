import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LENGTH = 64

export const hashPassword = (raw: string) => {
    const salt = randomBytes(16).toString('hex')
    const derived = scryptSync(raw, salt, KEY_LENGTH).toString('hex')
    return `${salt}:${derived}`
}

export const verifyPassword = (raw: string, stored: string) => {
    const [salt, currentHash] = stored.split(':')
    if (!salt || !currentHash) return false
    const derived = scryptSync(raw, salt, KEY_LENGTH)
    const hashBuffer = Buffer.from(currentHash, 'hex')
    if (hashBuffer.length !== derived.length) return false
    return timingSafeEqual(hashBuffer, derived)
}
