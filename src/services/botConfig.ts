import { PublicKey } from '@solana/web3.js'
import db from '../database/db'

// Check if bot is configured
export function isBotConfigured(): boolean {
  const config = db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
  return config && config.configured === 1
}

// Get current token CA
export function getTokenCA(): string | null {
  const config = db.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get() as any
  return config?.token_ca || null
}

// Get full bot config
export function getBotConfig() {
  return db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address)
    return PublicKey.isOnCurve(pubkey.toBytes())
  } catch {
    return false
  }
}

// Save bot configuration
export function saveBotConfig(tokenCA: string) {
  const existing = db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
  
  if (existing) {
    db.prepare(`
      UPDATE bot_config 
      SET token_ca = ?, configured = 1, setup_date = ?
      WHERE id = 1
    `).run(tokenCA, Math.floor(Date.now() / 1000))
  } else {
    db.prepare(`
      INSERT INTO bot_config (id, token_ca, configured, setup_date)
      VALUES (1, ?, 1, ?)
    `).run(tokenCA, Math.floor(Date.now() / 1000))
  }
}

// Check if user is admin
export function isAdmin(telegramId: number): boolean {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => parseInt(id.trim())) || []
  return adminIds.includes(telegramId)
}
