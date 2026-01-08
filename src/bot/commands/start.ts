import { Context } from 'telegraf'
import { Markup } from 'telegraf'
import db from '../../database/db'

export async function startCommand(ctx: Context) {
  try {
    const telegramId = ctx.from!.id
    const username = ctx.from!.username || 'Unknown'
    
    db.prepare('INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)').run(telegramId, username)
    
    // Check if token is configured
    const row = db.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get() as any
    const isConfigured = row && row.token_ca
    
    // Build welcome message
    let message = `🐋 Welcome to WHALU Protocol!\n\n`
    message += `鯨 = Whale in Japanese\n\n`
    message += `Coordinate community SOL buybacks with ocean precision.\n\n`
    
    message += `🌊 Three currents flowing as one\n`
    message += `🔒 Automated buybacks with transparency\n`
    message += `💎 Wave rider scoring system\n`
    message += `📊 Track all your protocol activity\n\n`
    
    message += `Type /help to see all available commands.\n\n`
    message += `Ocean precision. Global coordination. 鯨`
    
    // Create inline keyboard buttons
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 View Commands', 'help'),
        Markup.button.callback('🌀 Check Fuchi', 'fuchi')
      ],
      [
        Markup.button.url('💰 Buy Now', `https://pump.fun/${isConfigured ? row.token_ca : ''}`)
      ]
    ])
    
    await ctx.reply(message, keyboard)
    
  } catch (error: any) {
    console.error('/start error:', error)
    await ctx.reply("❌ Error: " + error.message)
  }
}
