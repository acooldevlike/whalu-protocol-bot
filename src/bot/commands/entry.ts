import { Context } from 'telegraf'
import db from '../../database/db'
import { getNamiEntries } from '../../services/nami/namiScore'

export async function entryCommand(ctx: Context) {
  try {
    const telegramId = ctx.from!.id
    
    const user = db.prepare('SELECT wallet_address FROM users WHERE telegram_id = ?').get(telegramId) as any
    
    if (!user || !user.wallet_address) {
      await ctx.reply('波 Link your wallet first: /link_wallet', { parse_mode: 'Markdown' })
      return
    }
    
    const entries = getNamiEntries(user.wallet_address)
    
    if (entries.length === 0) {
      await ctx.reply(
        `🎯 *ENTRY QUALITY*\n\n` +
        `No entries recorded yet.\n\n` +
        `Your buy timing will be tracked automatically.\n` +
        `Buy during dips to earn more points!`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    const score = db.prepare('SELECT entry_score FROM nami_scores WHERE wallet = ?').get(user.wallet_address) as any
    
    let message = `🎯 *ENTRY QUALITY: ${score?.entry_score > 0 ? '+' : ''}${score?.entry_score || 0}*\n\n`
    message += `Recent purchases:\n\n`
    
    for (const entry of entries) {
      const date = new Date(entry.buy_timestamp * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      const emoji = entry.points_earned > 0 ? '✅' : entry.points_earned < 0 ? '⚠️' : '➖'
      const contextLabel = entry.price_context.replace('_', ' ').toUpperCase()
      
      message += `${emoji} ${date}: ${entry.buy_amount.toFixed(0)} @ $${entry.buy_price.toFixed(6)}\n`
      message += `   (${contextLabel}) ${entry.points_earned > 0 ? '+' : ''}${entry.points_earned}\n\n`
    }
    
    message += `Smart buying = higher rewards`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Entry command error:', error)
    await ctx.reply('❌ Failed to load entry data.')
  }
}
