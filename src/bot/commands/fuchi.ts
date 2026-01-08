import { Context } from 'telegraf'
import { getTokenCA } from '../../services/botConfig'
import { getRealHolderCount, getRealMarketData } from '../../services/tokenData'
import db from '../../database/db'

export async function fuchiCommand(ctx: Context) {
  try {
    const row = db.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get() as any
    
    if (!row || !row.token_ca) {
      await ctx.reply("⚠️ Bot not configured")
      return
    }
    
    await ctx.reply("🔍 Fetching market data...")
    
    const tokenCA = row.token_ca
    
    let mcap = 0
    let price = 0
    
    try {
      const marketData = await getRealMarketData(tokenCA)
      mcap = marketData.mcap
      price = marketData.price
    } catch (error) {
      console.error('❌ Market data error:', error)
      await ctx.reply("⚠️ Could not fetch market data. Try again later.")
      return
    }
    
    // Calculate multiplier based on mcap only
    let multiplier = 1.0
    
    if (mcap >= 5000000) { multiplier = 2.0 }
    else if (mcap >= 1000000) { multiplier = 1.6 }
    else if (mcap >= 500000) { multiplier = 1.4 }
    else if (mcap >= 100000) { multiplier = 1.2 }
    
    // BUILD MESSAGE
    let message = `淵 *FUCHI POOL STATUS*\n\n`
    
    // SHOW LIVE DATA
    message += `📊 *LIVE DATA:*\n`
    message += `💰 Market Cap: *$${mcap.toLocaleString()}*\n`
    message += `💵 Price: *$${price.toFixed(8)}*\n\n`
    
    message += `🎯 *ACTIVE MULTIPLIER: ${multiplier.toFixed(2)}x*\n`
    message += `All rewards boosted by ${((multiplier - 1) * 100).toFixed(0)}%!\n\n`
    
    message += `━━━ *MCAP MILESTONES* ━━━\n`
    message += `${mcap >= 100000 ? '✅' : '⏳'} $100k (1.2x)`
    if (mcap < 100000) message += ` - $${(100000 - mcap).toLocaleString()} more`
    message += `\n`
    
    message += `${mcap >= 500000 ? '✅' : '⏳'} $500k (1.4x)`
    if (mcap < 500000) message += ` - $${(500000 - mcap).toLocaleString()} more`
    message += `\n`
    
    message += `${mcap >= 1000000 ? '✅' : '⏳'} $1M (1.6x)`
    if (mcap < 1000000) message += ` - $${(1000000 - mcap).toLocaleString()} more`
    message += `\n`
    
    message += `${mcap >= 5000000 ? '✅' : '⏳'} $5M (2x)\n\n`
    
    message += `The ocean rewards patience. 🐋`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Fuchi command error:', error)
    await ctx.reply('❌ Failed to load Fuchi pool data.')
  }
}
