import { Context } from 'telegraf'
import db from '../../database/db'
import { getRecentVolatilityEvents } from '../../services/nami/namiScore'

export async function diamondCommand(ctx: Context) {
  try {
    const telegramId = ctx.from!.id
    
    const user = db.prepare('SELECT wallet_address FROM users WHERE telegram_id = ?').get(telegramId) as any
    
    if (!user || !user.wallet_address) {
      await ctx.reply('💎 Link your wallet first: /link_wallet', { parse_mode: 'Markdown' })
      return
    }
    
    const score = db.prepare('SELECT diamond_score FROM nami_scores WHERE wallet = ?').get(user.wallet_address) as any
    const events = getRecentVolatilityEvents(10)
    
    if (events.length === 0) {
      await ctx.reply(
        `💎 *DIAMOND HANDS*\n\n` +
        `No volatility events recorded yet.\n\n` +
        `When price drops, holders who don't panic sell earn bonus points.\n\n` +
        `The ocean tests your resolve. 🐋`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    let message = `💎 *DIAMOND HANDS: ${score?.diamond_score > 0 ? '+' : ''}${score?.diamond_score || 0}*\n\n`
    message += `Volatility events survived:\n\n`
    
    for (const event of events) {
      const date = new Date(event.timestamp * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      const emoji = event.event_type === 'crash' ? '✅' : event.event_type === 'major_dip' ? '✅' : '✅'
      const points = event.event_type === 'crash' ? '+10' : event.event_type === 'major_dip' ? '+5' : '+2'
      
      message += `${emoji} ${date}: ${event.price_change_percent.toFixed(1)}% ${event.event_type.replace('_', ' ')} (Held) ${points}\n`
    }
    
    message += `\nYou held when others panicked.`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Diamond command error:', error)
    await ctx.reply('❌ Failed to load diamond data.')
  }
}
